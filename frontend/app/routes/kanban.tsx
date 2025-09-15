
import { useRef } from "react";
import type { Todo } from "~/lib/types/todo";
import { useTodos } from "~/lib/hooks/useTodos";
import { KanbanColumn } from "../components/kanban/KanbanColumn";
import { KanbanCard } from "../components/kanban/KanbanCard";

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function KanbanRoute() {

  const state = useTodos();
  const cards = state.items.filter((t) => t.status !== 'archived');
  const dragTodoId = useRef<string | null>(null);

  function handleDragStart(todoId: string) {
    dragTodoId.current = todoId;
  }

  async function handleDrop(colId: string) {
    const todoId = dragTodoId.current;
    if (!todoId) return;
    const todo = state.items.find((t) => t.id === todoId);
    if (!todo || todo.status === colId) return;
    // Patch status (cast colId to Todo["status"])
    await state.patch(todo.id, todo.version, { status: colId as Todo["status"] });
    dragTodoId.current = null;
  }

  function handleDragEnd() {
    dragTodoId.current = null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 min-h-[60vh]">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e: React.DragEvent) => { e.preventDefault(); }}
              onDrop={() => handleDrop(col.id)}
              className="flex-1"
            >
              <KanbanColumn id={col.id} title={col.title} count={colCards.length}>
                {state.loading ? (
                  <div className="text-muted-foreground text-sm">Loading...</div>
                ) : state.error ? (
                  <div className="text-red-500 text-sm">{state.error.message}</div>
                ) : colCards.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No cards</div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <KanbanCard todo={card} />
                    </div>
                  ))
                )}
              </KanbanColumn>
            </div>
          );
        })}
      </div>
    </div>
  );
}
