import { cn } from "~/lib/utils";
import type { Todo } from "~/lib/types/todo";
import { formatRelativeDate } from "./date-utils";

export function DueDateBadge({
  dueAt,
  status,
}: {
  dueAt?: string | null;
  status: Todo["status"];
}) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const now = new Date();
  const overdue =
    due.getTime() < now.getTime() && !["done", "archived"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        overdue
          ? "bg-destructive/15 text-destructive border-destructive/40"
          : "bg-muted text-muted-foreground border-border"
      )}
      title={due.toISOString()}
      aria-label={overdue ? "Overdue" : "Due date"}
    >
      {formatRelativeDate(due)}
    </span>
  );
}
