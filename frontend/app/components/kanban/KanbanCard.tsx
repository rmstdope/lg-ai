import { useUserMap } from "~/lib/hooks/useUsers";
import { useCurrentUser } from "~/lib/hooks/useCurrentUser";
import type { Todo } from "~/lib/types/todo";
import { PriorityBadge } from "../todos/PriorityBadge";
import { DueDateBadge } from "../todos/DueDateBadge";
import { TagChips } from "../todos/TagChips";

interface KanbanCardProps {
  todo: Todo;
}

export function KanbanCard({ todo }: KanbanCardProps) {
  const { userMap } = useUserMap();
  const { user: currentUser } = useCurrentUser();
  const assigneeName = todo.assignee != null ? userMap[todo.assignee] : undefined;
  const isMine = currentUser && todo.assignee === currentUser.id;
  return (
    <div
      className={
        [
          isMine ? "bg-green-50" : "bg-white",
          "p-4 mb-3 border border-muted rounded-2xl shadow-lg flex flex-col gap-2 transition-transform duration-150 hover:scale-[1.025] hover:shadow-xl hover:border-primary/40"
        ].join(" ")
      }
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium line-clamp-2">{todo.title}</div>
        {assigneeName && (
          <span className="text-muted-foreground italic text-xs ml-2" aria-label="Assignee">
            {assigneeName}
          </span>
        )}
      </div>
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
