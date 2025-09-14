import { Router } from 'express';
import { list, getById, create, update, remove } from '../repo/todos';
import { assertBodyTodoCreate, assertBodyTodoPatch, parsePositiveInt, sanitizeQ, isStatus } from '../utils/validate';
import { httpError } from '../utils/errors';
import { normalizePaging } from '../utils/pagination';

export const todosRouter = Router();

// GET /todos
// Query params: q, status, tag, overdue, sort, order, page, pageSize
// Response: { items, page, pageSize, total }

todosRouter.get('/todos', (req, res) => {
  const q = sanitizeQ(req.query.q as string | undefined);
  const status = req.query.status ? (req.query.status as string) : undefined;
  if (status && !isStatus(status)) httpError(400, 'Invalid status filter', 'status');
  const tag = req.query.tag ? String(req.query.tag) : undefined;
  const overdue = req.query.overdue === 'true';
  const sort = (['createdAt','updatedAt','dueAt','priority','title'] as const).includes(req.query.sort as any) ? req.query.sort as any : 'updatedAt';
  const order = (req.query.order === 'asc') ? 'asc' : 'desc';
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 10, 100);
  const { limit, offset } = normalizePaging({ page, pageSize });

  const { items, total } = list({ q, status: status as any, tag, overdue, sort, order, limit, offset });
  res.json({ items, page, pageSize, total });
});

// GET /todos/:id
// Response: Todo or 404

todosRouter.get('/todos/:id', (req, res) => {
  const todo = getById(req.params.id);
  if (!todo) return res.status(404).json({ code: 404, message: 'Not found' });
  res.json(todo);
});

// POST /todos

todosRouter.post('/todos', (req, res) => {
  const body = assertBodyTodoCreate(req.body);
  const todo = create(body);
  res.status(201).json(todo);
});

// PATCH /todos/:id (optimistic concurrency via If-Match header)

todosRouter.patch('/todos/:id', (req, res) => {
  const ifMatch = req.header('If-Match');
  if (!ifMatch) httpError(400, 'If-Match header required');
  const version = Number(ifMatch);
  if (!Number.isInteger(version) || version < 1) httpError(400, 'Invalid If-Match version');
  const body = assertBodyTodoPatch(req.body);
  try {
    const updated = update(req.params.id, version, body);
    res.json(updated);
  } catch (e: any) {
    if (e && typeof e === 'object' && 'code' in e && (e as any).code === 409) {
      return res.status(409).json({ code: 409, message: 'Version conflict', current: (e as any).current });
    }
    if (e && typeof e === 'object' && 'code' in e && (e as any).code === 404) {
      return res.status(404).json({ code: 404, message: 'Not found' });
    }
    throw e;
  }
});

// DELETE /todos/:id

todosRouter.delete('/todos/:id', (req, res) => {
  remove(req.params.id);
  res.status(204).end();
});
