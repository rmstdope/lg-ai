import { useState } from "react";
import type { UseTodosState } from "~/lib/hooks/useTodos";

interface TodoFiltersProps {
  state: Pick<
    UseTodosState,
    "filters" | "setFilters" | "pageSize" | "setPage" | "inFlightCount"
  > & { setPageSize?: (n: number) => void };
}

export function TodoFilters({ state }: TodoFiltersProps) {
  const { filters, setFilters, inFlightCount } = state;
  const [tagInput, setTagInput] = useState(filters.tag || "");

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          type="text"
          defaultValue={filters.q}
          onChange={(e) =>
            setFilters((f) => ({ ...f, q: e.target.value || undefined }))
          }
          placeholder="Title or description"
          className="h-9 px-2 rounded-md border bg-background"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className="h-9 px-2 rounded-md border bg-background"
          value={filters.status || "all"}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value as any }))
          }
        >
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="tag">
          Tag
        </label>
        <div className="flex gap-1">
          <input
            id="tag"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tag"
            className="h-9 px-2 rounded-md border bg-background"
          />
          <button
            type="button"
            onClick={() =>
              setFilters((f) => ({ ...f, tag: tagInput || undefined }))
            }
            className="px-3 h-9 rounded-md border bg-muted text-xs"
          >
            Apply
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 h-9 mt-5">
        <label className="text-xs flex items-center gap-1">
          <input
            type="checkbox"
            checked={Boolean(filters.overdue)}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                overdue: e.target.checked || undefined,
              }))
            }
          />
          Overdue
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          className="h-9 px-2 rounded-md border bg-background"
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sort: e.target.value as any }))
          }
        >
          <option value="updatedAt">Updated</option>
          <option value="createdAt">Created</option>
          <option value="dueAt">Due</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="order">
          Order
        </label>
        <select
          id="order"
          className="h-9 px-2 rounded-md border bg-background"
          value={filters.order || "desc"}
          onChange={(e) =>
            setFilters((f) => ({ ...f, order: e.target.value as any }))
          }
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <div className="text-xs text-muted-foreground mt-5" aria-live="polite">
        {inFlightCount > 0 && <span>Updating…</span>}
      </div>
    </div>
  );
}
