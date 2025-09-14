import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ListParams,
  type ListResponse,
  type Todo,
  ApiError,
  isApiError,
} from "~/lib/types/todo";
import { createTodo, deleteTodo, listTodos, updateTodo } from "../../../todos";

// Public shape returned by the hook
export interface UseTodosState {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  filters: Omit<ListParams, "page" | "pageSize">;
  setFilters: (
    updater: (
      f: Omit<ListParams, "page" | "pageSize">
    ) => Omit<ListParams, "page" | "pageSize">
  ) => void;
  refresh: () => void;
  loading: boolean;
  error: ApiError | null;
  creating: boolean;
  updatingIds: Set<string>;
  deletingIds: Set<string>;
  create: (input: Parameters<typeof createTodo>[0]) => Promise<Todo | null>;
  patch: (
    id: string,
    version: number,
    patch: Parameters<typeof updateTodo>[2]
  ) => Promise<Todo | null>;
  remove: (id: string) => Promise<boolean>;
  hasMore: boolean;
  inFlightCount: number;
}

interface InternalFilterState {
  q?: string;
  status?: Todo["status"] | "all";
  tag?: string;
  overdue?: boolean;
  sort?: "updatedAt" | "createdAt" | "dueAt" | "priority" | "title";
  order?: "asc" | "desc";
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_FILTERS: InternalFilterState = {
  sort: "updatedAt",
  order: "desc",
  status: "all",
};

export function useTodos(): UseTodosState {
  const [items, setItems] = useState<Todo[]>([]);
  const lastGoodItemsRef = useRef<Todo[]>([]); // cache last successful page
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFiltersState] =
    useState<InternalFilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [creating, setCreating] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<number | null>(null);
  const [pendingSearch, setPendingSearch] = useState<string | undefined>(
    undefined
  );

  const inFlightCount =
    (loading ? 1 : 0) +
    (creating ? 1 : 0) +
    updatingIds.size +
    deletingIds.size;

  // Derived ListParams
  const listParams: ListParams = useMemo(
    () => ({
      ...filters,
      page,
      pageSize,
    }),
    [filters, page, pageSize]
  );

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const resp: ListResponse = await listTodos(listParams);
        setItems(resp.items);
        lastGoodItemsRef.current = resp.items;
        setTotal(resp.total);
        // Adjust if current page beyond range after deletes
        const maxPage = Math.max(1, Math.ceil(resp.total / resp.pageSize));
        if (page > maxPage) {
          setPage(maxPage);
        }
      } catch (e) {
        if ((e as any)?.name === "AbortError") return; // ignore aborts
        setError(
          isApiError(e)
            ? e
            : new ApiError({ status: 0, message: "Unknown error" })
        );
        // Keep showing last good items (avoid flash)
        setItems(lastGoodItemsRef.current);
      } finally {
        setLoading(false);
      }
    },
    [listParams, page]
  );

  // Effect: refetch on param change w/ debounced search
  useEffect(() => {
    // Debounce only q
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const delay = filters.q ? 300 : 0;
    debounceTimer.current = window.setTimeout(() => {
      fetchList(controller.signal);
    }, delay);

    return () => {
      controller.abort();
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [
    fetchList,
    filters.q,
    filters.status,
    filters.tag,
    filters.overdue,
    filters.sort,
    filters.order,
    page,
    pageSize,
  ]);

  // Public setter resetting page when filters change
  const setFilters = useCallback(
    (updater: (f: InternalFilterState) => InternalFilterState) => {
      setPage(1);
      setFiltersState((prev) => updater(prev));
    },
    []
  );

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  // Create optimistic
  const create = useCallback<UseTodosState["create"]>(
    async (input) => {
      if (creating) return null; // prevent duplicate submissions
      setCreating(true);
      const tempId = `temp-${Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();
      const tempTodo: Todo = {
        id: tempId,
        title: input.title,
        description: input.description,
        status: input.status || "todo",
        priority: input.priority ?? 3,
        tags: input.tags || [],
        dueAt: input.dueAt,
        createdAt: now,
        updatedAt: now,
        version: 0,
      };

      // Insert temp at top if sorting by updatedAt desc else push
      setItems((prev) => {
        if (filters.sort === "updatedAt" && filters.order !== "asc") {
          return [tempTodo, ...prev];
        }
        return [...prev, tempTodo];
      });

      try {
        const real = await createTodo(input);
        setItems((prev) => prev.map((t) => (t.id === tempId ? real : t)));
        setTotal((t) => t + 1); // naive increment; server response will adjust on next refetch
        return real;
      } catch (e) {
        setItems((prev) => prev.filter((t) => t.id !== tempId));
        setError(
          isApiError(e)
            ? e
            : new ApiError({ status: 0, message: "Create failed" })
        );
        return null;
      } finally {
        setCreating(false);
      }
    },
    [creating, filters.sort, filters.order]
  );

  const patch = useCallback<UseTodosState["patch"]>(
    async (id, version, patch) => {
      if (updatingIds.has(id)) return null;
      setUpdatingIds((s) => new Set(s).add(id));
      const snapshot = items.find((t) => t.id === id);
      const optimistic: Todo | undefined = snapshot
        ? ({
            ...snapshot,
            ...patch,
            updatedAt: new Date().toISOString(),
          } as Todo)
        : undefined;
      if (optimistic)
        setItems((prev) => prev.map((t) => (t.id === id ? optimistic : t)));

      try {
        const updated = await updateTodo(id, version, patch);
        setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } catch (e) {
        if (snapshot) {
          setItems((prev) => prev.map((t) => (t.id === id ? snapshot : t))); // rollback
        }
        setError(
          isApiError(e)
            ? e
            : new ApiError({ status: 0, message: "Update failed" })
        );
        return null;
      } finally {
        setUpdatingIds((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    },
    [items, updatingIds]
  );

  const remove = useCallback<UseTodosState["remove"]>(
    async (id) => {
      if (deletingIds.has(id)) return false;
      setDeletingIds((s) => new Set(s).add(id));
      const snapshot = items;
      setItems((prev) => prev.filter((t) => t.id !== id));
      try {
        await deleteTodo(id);
        setTotal((t) => Math.max(0, t - 1));
        // If page empty and not first, refetch previous page
        if (items.length === 1 && page > 1) {
          setPage(page - 1);
        }
        return true;
      } catch (e) {
        setItems(snapshot); // rollback
        setError(
          isApiError(e)
            ? e
            : new ApiError({ status: 0, message: "Delete failed" })
        );
        return false;
      } finally {
        setDeletingIds((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    },
    [deletingIds, items, page]
  );

  const hasMore = useMemo(
    () => page * pageSize < total,
    [page, pageSize, total]
  );

  return {
    items,
    total,
    page,
    pageSize,
    setPage: (p) => setPage(p),
    filters,
    setFilters,
    refresh,
    loading,
    error,
    creating,
    updatingIds,
    deletingIds,
    create,
    patch,
    remove,
    hasMore,
    inFlightCount,
  };
}
