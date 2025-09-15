import type { Todo } from "~/lib/types/todo";
import { PriorityBadge } from "../todos/PriorityBadge";
import { DueDateBadge } from "../todos/DueDateBadge";
import { TagChips } from "../todos/TagChips";

interface KanbanCardProps {
  todo: Todo;
}

export function KanbanCard({ todo }: KanbanCardProps) {
  return (
    <div className="bg-white rounded shadow p-4 mb-2">
      <div className="font-medium mb-1 line-clamp-2">{todo.title}</div>
      <div className="flex flex-wrap gap-2 items-center text-xs mb-1">
        <PriorityBadge value={todo.priority} />
        <DueDateBadge dueAt={todo.dueAt} status={todo.status} />
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
