// Domain types for Todo feature
// These mirror backend contract documented in HTTP_API.md

export type TodoStatus = "todo" | "in_progress" | "done" | "archived";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: number; // 1..5
  tags: string[];
  dueAt?: string | null; // ISO string or null
  createdAt: string; // ISO
  updatedAt: string; // ISO
  version: number; // optimistic concurrency token
}

export interface ListParams {
  q?: string;
  status?: TodoStatus | "all";
  tag?: string;
  overdue?: boolean;
  sort?: "updatedAt" | "createdAt" | "dueAt" | "priority" | "title";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ListResponse {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: TodoStatus; // default server side = 'todo'
  priority?: number; // default 3
  tags?: string[];
  dueAt?: string | null;
}

// Update uses PATCH semantics; all optional except need at least one prop
export interface UpdateTodoInput {
  title?: string;
  description?: string | null; // allow clearing description with null
  status?: TodoStatus;
  priority?: number;
  tags?: string[]; // full replacement
  dueAt?: string | null; // null clears
}

export interface ApiErrorShape {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  fieldErrors?: Record<string, string>; // for 422 validation mapping
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code?: string | undefined;
  details?: Record<string, unknown> | undefined;
  fieldErrors?: Record<string, string> | undefined;
  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.code = shape.code;
    this.details = shape.details;
    this.fieldErrors = shape.fieldErrors;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

// Helper to build query string from ListParams (exported for tests / reuse)
export function buildTodoQuery(params: ListParams): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q.trim());
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.tag) qs.set("tag", params.tag);
  if (params.overdue) qs.set("overdue", "true");
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  if (params.pageSize && params.pageSize !== 10)
    qs.set("pageSize", String(params.pageSize));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// Tag normalization (simple trim). Further rules (lowercase etc) can be added.
export function normalizeTag(tag: string): string {
  return tag.trim();
}

// Merge conflict placeholder util for potential advanced resolution.
export function mergeConflict<T extends { updatedAt: string }>(
  localDraft: T,
  serverCopy: T
): T {
  // For now just return server copy; later could implement field-wise diff/merge.
  return serverCopy;
}
