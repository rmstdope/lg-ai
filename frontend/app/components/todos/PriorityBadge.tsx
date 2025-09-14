import { cn } from "~/lib/utils";
import type { Todo } from "~/lib/types/todo";

const priorityColors: Record<number, string> = {
  1: "bg-destructive/15 text-destructive border-destructive/40",
  2: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40",
  3: "bg-muted text-foreground border-border",
  4: "bg-secondary text-secondary-foreground border-secondary/40",
  5: "bg-muted/60 text-muted-foreground border-muted/40",
};

export function PriorityBadge({ value }: { value: Todo["priority"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        priorityColors[value] || priorityColors[3]
      )}
      aria-label={`Priority ${value}`}
    >
      P{value}
    </span>
  );
}
