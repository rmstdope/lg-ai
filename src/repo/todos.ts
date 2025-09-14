import { db, withTx } from '../db';
import { mapRowToTodo, Todo, TodoRow, Status } from '../types';
import { nowIso } from '../config';
import { HttpError } from '../utils/errors';
import crypto from 'crypto';

export interface ListParams {
  q?: string; status?: Status; tag?: string; overdue?: boolean;
  sort?: 'createdAt'|'updatedAt'|'dueAt'|'priority'|'title'; order?: 'asc'|'desc';
  limit: number; offset: number;
}

const SORT_COLUMN: Record<string,string> = {
  createdAt: 'todos.created_at',
  updatedAt: 'todos.updated_at',
  dueAt: 'todos.due_at',
  priority: 'todos.priority',
  title: 'todos.title'
};

export function list(params: ListParams): { items: Todo[]; total: number } {
  const filters: string[] = [];
  const args: any[] = [];

  if (params.status) { filters.push('todos.status = ?'); args.push(params.status); }
  if (params.tag) { filters.push('EXISTS (SELECT 1 FROM todo_tags tt2 WHERE tt2.todo_id = todos.id AND tt2.tag = ?)'); args.push(params.tag); }
  if (params.overdue) { filters.push("todos.due_at IS NOT NULL AND todos.due_at < ? AND todos.status NOT IN ('done','archived')"); args.push(nowIso()); }
  if (params.q) { filters.push('(LOWER(todos.title) LIKE ? OR LOWER(todos.description) LIKE ?)'); const pat = `%${params.q.toLowerCase()}%`; args.push(pat, pat); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const sortCol = SORT_COLUMN[params.sort || 'updatedAt'] || SORT_COLUMN.updatedAt;
  const order = params.order === 'asc' ? 'ASC' : 'DESC';

  const baseSelect = `FROM todos LEFT JOIN todo_tags tt ON tt.todo_id = todos.id ${where}`;
  const sql = `SELECT todos.*, GROUP_CONCAT(tt.tag, ',') AS tagsCsv ${baseSelect} GROUP BY todos.id ORDER BY ${sortCol} ${order} LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...args, params.limit, params.offset) as TodoRow[];
  const items = rows.map(mapRowToTodo);

  const countSql = `SELECT COUNT(DISTINCT todos.id) as c ${baseSelect}`;
  const totalRow = db.prepare(countSql).get(...args) as { c: number };

  return { items, total: totalRow.c };
}

export function getById(id: string): Todo | undefined {
  const row = db.prepare(`SELECT todos.*, (SELECT GROUP_CONCAT(tag, ',') FROM todo_tags WHERE todo_id = todos.id) AS tagsCsv FROM todos WHERE id = ?`).get(id) as TodoRow | undefined;
  return row ? mapRowToTodo(row) : undefined;
}

export interface CreateInput { title: string; description?: string; status?: Status; priority?: number; dueAt?: string; tags?: string[]; }

export function create(input: CreateInput): Todo {
  const id = crypto.randomUUID();
  const now = nowIso();
  const insertTodo = db.prepare(`INSERT INTO todos (id,title,description,status,priority,due_at,created_at,updated_at,version) VALUES (?,?,?,?,?,?,?,?,1)`);
  const insertTag = db.prepare(`INSERT INTO todo_tags (todo_id, tag) VALUES (?,?)`);
  withTx(() => {
    insertTodo.run(id, input.title, input.description ?? null, input.status ?? 'todo', input.priority ?? 3, input.dueAt ?? null, now, now);
    if (input.tags) input.tags.forEach(tag => insertTag.run(id, tag));
  });
  return getById(id)!; // should exist
}

export interface PatchInput { title?: string; description?: string; status?: Status; priority?: number; dueAt?: string; tags?: string[]; }

export function update(id: string, expectedVersion: number, patch: PatchInput): Todo {
  const currentRow = db.prepare(`SELECT * FROM todos WHERE id = ?`).get(id) as TodoRow | undefined;
  if (!currentRow) throw new HttpError(404, 'Not found');
  if (currentRow.version !== expectedVersion) {
    throw new HttpError(409, 'Version conflict', undefined, { current: getById(id) });
  }

  const sets: string[] = [];
  const args: any[] = [];
  if (patch.title !== undefined) { sets.push('title = ?'); args.push(patch.title); }
  if (patch.description !== undefined) { sets.push('description = ?'); args.push(patch.description ?? null); }
  if (patch.status !== undefined) { sets.push('status = ?'); args.push(patch.status); }
  if (patch.priority !== undefined) { sets.push('priority = ?'); args.push(patch.priority); }
  if (patch.dueAt !== undefined) { sets.push('due_at = ?'); args.push(patch.dueAt ?? null); }
  sets.push('updated_at = ?'); args.push(nowIso());
  sets.push('version = version + 1');

  withTx(() => {
    if (sets.length > 0) {
      const sql = `UPDATE todos SET ${sets.join(', ')} WHERE id = ?`;
      db.prepare(sql).run(...args, id);
    }
    if (patch.tags) {
      db.prepare(`DELETE FROM todo_tags WHERE todo_id = ?`).run(id);
      const ins = db.prepare(`INSERT INTO todo_tags (todo_id, tag) VALUES (?,?)`);
      patch.tags.forEach(tag => ins.run(id, tag));
    }
  });
  return getById(id)!;
}

export function remove(id: string): void {
  db.prepare(`DELETE FROM todos WHERE id = ?`).run(id);
}
