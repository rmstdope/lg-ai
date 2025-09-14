import { TodoCard } from "./TodoCard";
import type { UseTodosState } from "~/lib/hooks/useTodos";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface TodoListProps {
  state: UseTodosState;
  onEdit: (id: string) => void;
  onCreateRequest: () => void;
  renderActions?: (id: string) => React.ReactNode;
}

export function TodoList({
  state,
  onEdit,
  onCreateRequest,
  renderActions,
}: TodoListProps) {
  const { items, loading, error, refresh, deletingIds, updatingIds } = state;

  if (error && items.length === 0) {
    return <ErrorState error={error} onRetry={refresh} />;
  }
  if (loading && items.length === 0) {
    return <LoadingSkeleton rows={5} />;
  }
  if (!loading && items.length === 0) {
    return <EmptyState onCreate={onCreateRequest} />;
  }

  return (
    <div className="grid gap-4" aria-live="polite">
      {items.map((t) => (
        <TodoCard
          key={t.id}
          todo={t}
          onClickTitle={() => onEdit(t.id)}
          actions={renderActions?.(t.id)}
          pendingDelete={deletingIds.has(t.id)}
          updating={updatingIds.has(t.id)}
        />
      ))}
      {loading && items.length > 0 && (
        <div className="opacity-60 animate-pulse" aria-label="Updating list" />
      )}
    </div>
  );
}
