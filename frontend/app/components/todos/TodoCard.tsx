import type { Todo } from "~/lib/types/todo";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { DueDateBadge } from "./DueDateBadge";
import { TagChips } from "./TagChips";
import { cn } from "~/lib/utils";

interface TodoCardProps {
  todo: Todo;
  onClickTitle?: (todo: Todo) => void;
  actions?: React.ReactNode;
  pendingDelete?: boolean;
  updating?: boolean;
}

export function TodoCard({
  todo,
  onClickTitle,
  actions,
  pendingDelete,
  updating,
}: TodoCardProps) {
  const overdue =
    todo.dueAt &&
    new Date(todo.dueAt).getTime() < Date.now() &&
    !["done", "archived"].includes(todo.status);
  return (
    <div
      className={cn(
        "group relative border rounded-md p-4 flex flex-col gap-3 bg-card transition-shadow",
        "hover:shadow-sm focus-within:shadow-sm",
        overdue && "border-l-2 border-destructive",
        pendingDelete && "opacity-50 pointer-events-none",
        updating && "outline outline-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <button
            className="text-left font-semibold text-sm md:text-base line-clamp-2 hover:underline decoration-dotted"
            onClick={() => onClickTitle?.(todo)}
          >
            {todo.title}
          </button>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <PriorityBadge value={todo.priority} />
            <StatusBadge status={todo.status} />
            <DueDateBadge dueAt={todo.dueAt} status={todo.status} />
            <span className="text-muted-foreground" aria-label="Updated at">
              {formatUpdatedAt(todo.updatedAt)}
            </span>
          </div>
        </div>
        {actions && <div className="self-start">{actions}</div>}
      </div>
      {todo.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
          {todo.description}
        </p>
      )}
      <TagChips tags={todo.tags} />
    </div>
  );
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return iso.slice(0, 10);
}
