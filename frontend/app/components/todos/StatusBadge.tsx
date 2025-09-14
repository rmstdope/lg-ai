import { cn } from "~/lib/utils";
import type { Todo } from "~/lib/types/todo";

const statusClass: Record<Todo["status"], string> = {
  todo: "bg-primary/15 text-primary border-primary/40",
  in_progress:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40",
  done: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/40",
  archived: "bg-muted text-muted-foreground border-muted-foreground/20",
};

export function StatusBadge({ status }: { status: Todo["status"] }) {
  const label = status.replace("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize",
        statusClass[status]
      )}
    >
      {label}
    </span>
  );
}
