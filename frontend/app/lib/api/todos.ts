// API client for Todo backend relocated to avoid path collision with route path.
// Uses fetch; centralizes error normalization and concurrency control.

import {
  ApiError,
  type CreateTodoInput,
  type ListParams,
  type ListResponse,
  type Todo,
  type UpdateTodoInput,
  buildTodoQuery,
} from "~/lib/types/todo";
import { getAuthHeader } from "../auth";

const BASE_URL = "http://localhost:3000"; // backend origin

interface FetchOptions extends RequestInit {
  jsonBody?: unknown;
  expectedStatus?: number | number[];
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { jsonBody, expectedStatus, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  // Add Authorization header if not already present
  if (!finalHeaders["Authorization"]) {
    const auth = getAuthHeader();
    if (auth) finalHeaders["Authorization"] = auth;
  }
  let body: BodyInit | undefined;
  if (jsonBody !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(jsonBody);
  }

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      ...rest,
      headers: finalHeaders,
      body,
    });
  } catch (e) {
    throw new ApiError({
      status: 0,
      message: "Network error",
      details: { cause: String(e) },
    });
  }

  const okStatuses = expectedStatus
    ? Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus]
    : [200, 201, 204];

  let data: any = undefined;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!okStatuses.includes(res.status)) {
    const errShape = new ApiError({
      status: res.status,
      message: data?.message || res.statusText || "Request failed",
      code: data?.code,
      details: data?.details,
      fieldErrors: data?.fieldErrors,
    });
    throw errShape;
  }

  return data as T;
}

export async function listTodos(params: ListParams): Promise<ListResponse> {
  const query = buildTodoQuery(params);
  return apiFetch<ListResponse>(`/todos${query}`);
}

export async function getTodo(id: string): Promise<Todo> {
  return apiFetch<Todo>(`/todos/${encodeURIComponent(id)}`);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return apiFetch<Todo>(`/todos`, {
    method: "POST",
    jsonBody: input,
    expectedStatus: 201,
  });
}

export interface UpdateTodoResult {
  todo: Todo;
}

export async function updateTodo(
  id: string,
  version: number,
  patch: UpdateTodoInput
): Promise<Todo> {
  return apiFetch<Todo>(`/todos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "If-Match": String(version) },
    jsonBody: patch,
    expectedStatus: 200,
  });
}

export async function deleteTodo(id: string): Promise<void> {
  await apiFetch(`/todos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    expectedStatus: [200, 204],
  });
}

export type {
  CreateTodoInput,
  ListParams,
  ListResponse,
  Todo,
  UpdateTodoInput,
};
