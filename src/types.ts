export type Status = 'todo' | 'in_progress' | 'done' | 'archived';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: 1|2|3|4|5;
  tags: string[];
  dueAt?: string; // ISO8601
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  version: number;
}

export interface ApiError {
  code: 400|409|422|500|404;
  message: string;
  field?: string;
  current?: Todo; // for conflict
}

// Internal DB row shapes (snake_case)
export interface TodoRow {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: number; // 1..5
  due_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  tagsCsv?: string | null; // from GROUP_CONCAT
}

export function mapRowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority as 1|2|3|4|5,
    tags: row.tagsCsv ? row.tagsCsv.split(',').filter(Boolean) : [],
    dueAt: row.due_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version
  };
}
