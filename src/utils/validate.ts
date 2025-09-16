import { Status } from '../types';
import { httpError } from './errors';

export function isStatus(v: unknown): v is Status {
  return v === 'todo' || v === 'in_progress' || v === 'done' || v === 'archived';
}

export function isPriority(n: unknown): n is 1|2|3|4|5 {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5;
}

export function parsePositiveInt(q: unknown, def: number, max?: number): number {
  if (q === undefined || q === null || q === '') return def;
  const n = Number(q);
  if (!Number.isInteger(n) || n <= 0) httpError(400, 'Invalid positive integer');
  if (max && n > max) return max;
  return n;
}

export function sanitizeQ(q: unknown): string | undefined {
  if (typeof q !== 'string') return undefined;
  const trimmed = q.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 200); // cap length
}

const TAG_RE = /^[A-Za-z0-9\-_\/]{1,30}$/;

interface TodoCreateBody {
  title: string;
  description?: string;
  status?: Status;
  priority?: number;
  dueAt?: string;
  tags?: string[];
  assignee?: number | null;
}
interface TodoPatchBody extends Partial<TodoCreateBody> {}

function validateCommon(body: TodoCreateBody | TodoPatchBody, isPatch: boolean) {
  if (!isPatch || body.title !== undefined) {
    if (typeof body.title !== 'string') httpError(422, 'title required', 'title');
    const title = body.title.trim();
    if (!title) httpError(422, 'title cannot be empty', 'title');
    if (title.length > 200) httpError(422, 'title too long', 'title');
    body.title = title;
  }
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') httpError(422, 'description must be string', 'description');
    if (body.description.length > 10_000) httpError(422, 'description too long', 'description');
  }
  if (body.status !== undefined && !isStatus(body.status)) httpError(422, 'invalid status', 'status');
  if (body.priority !== undefined) {
    if (typeof body.priority !== 'number' || !Number.isInteger(body.priority)) httpError(422, 'priority must be int', 'priority');
    if (body.priority < 1 || body.priority > 5) httpError(422, 'priority out of range', 'priority');
  }
  if (body.dueAt !== undefined) {
    if (typeof body.dueAt !== 'string') httpError(422, 'dueAt must be ISO string', 'dueAt');
    const d = new Date(body.dueAt);
    if (isNaN(d.getTime())) httpError(422, 'dueAt invalid date', 'dueAt');
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) httpError(422, 'tags must be array', 'tags');
    if (body.tags.length > 20) httpError(422, 'too many tags', 'tags');
    body.tags.forEach((t, idx) => {
      if (typeof t !== 'string' || !TAG_RE.test(t)) httpError(422, `invalid tag at index ${idx}`, 'tags');
    });
  }
}

export function assertBodyTodoCreate(raw: unknown): TodoCreateBody {
  if (!raw || typeof raw !== 'object') httpError(422, 'body required');
  const body = raw as TodoCreateBody;
  validateCommon(body, false);
  if (!('assignee' in body)) body.assignee = null;
  return body;
}

export function assertBodyTodoPatch(raw: unknown): TodoPatchBody {
  if (!raw || typeof raw !== 'object') httpError(422, 'body required');
  const body = raw as TodoPatchBody;
  if (Object.keys(body).length === 0) httpError(422, 'empty patch');
  validateCommon(body, true);
  if (!('assignee' in body)) body.assignee = undefined;
  return body;
}
