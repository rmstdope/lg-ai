import type { Todo } from "~/lib/types/todo";
import { PriorityBadge } from "../todos/PriorityBadge";
import { DueDateBadge } from "../todos/DueDateBadge";
import { TagChips } from "../todos/TagChips";

interface KanbanCardProps {
  todo: Todo;
}

export function KanbanCard({ todo }: KanbanCardProps) {
  return (
      <div
        className="bg-white p-4 mb-3 border border-muted rounded-2xl shadow-lg flex flex-col gap-2 transition-transform duration-150 hover:scale-[1.025] hover:shadow-xl hover:border-primary/40"
      >
      <div className="font-medium mb-1 line-clamp-2">{todo.title}</div>
      <div className="flex flex-wrap gap-2 items-center text-xs mb-1">
    <PriorityBadge value={todo.priority} />
    {todo.dueAt && <DueDateBadge dueAt={todo.dueAt} status={todo.status} />}
      </div>
      {todo.description && (
        <div className="text-gray-500 text-xs mb-1 line-clamp-2 whitespace-pre-wrap">
          {todo.description}
        </div>
      )}
      <TagChips tags={todo.tags} />
    </div>
  );
}
