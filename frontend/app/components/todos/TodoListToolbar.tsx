import { Plus } from "lucide-react";
import type { UseTodosState } from "~/lib/hooks/useTodos";
import { TodoFilters } from "./TodoFilters";

interface ToolbarProps {
  state: UseTodosState;
  onOpenCreate: () => void;
}

export function TodoListToolbar({ state, onOpenCreate }: ToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Todos</h2>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="size-4" /> New Todo
        </button>
      </div>
      <TodoFilters state={state as any} />
    </div>
  );
}
