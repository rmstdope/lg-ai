

import { useRef, useState } from "react";
import { KanbanFilterDialog } from "../components/kanban/KanbanFilterDialog";
import type { Todo } from "~/lib/types/todo";
import { useTodos } from "~/lib/hooks/useTodos";
import { KanbanColumn } from "../components/kanban/KanbanColumn";
import { KanbanCard } from "../components/kanban/KanbanCard";
import { KanbanEditDialog } from "../components/kanban/KanbanEditDialog";


const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];
export default function KanbanRoute() {
  const state = useTodos();
  const cards = state.items.filter((t) => t.status !== 'archived');

  const dragTodoId = useRef<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  // Global filter state
  const [priorityFilter, setPriorityFilter] = useState<number[]>([]);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  function handleDragStart(todoId: string) {
    dragTodoId.current = todoId;
  }

  async function handleDrop(colId: string) {
    const todoId = dragTodoId.current;
    if (!todoId) {
      setDragOverCol(null);
      return;
    }
    const todo = state.items.find((t) => t.id === todoId);
    if (!todo || todo.status === colId) {
      setDragOverCol(null);
      return;
    }
    await state.patch(todo.id, todo.version, { status: colId as Todo["status"] });
    dragTodoId.current = null;
    setDragOverCol(null);
  }

  function handleDragEnd() {
    dragTodoId.current = null;
    setDragOverCol(null);
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <button
            className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 border text-sm"
            onClick={() => setFilterDialogOpen(true)}
            aria-label="Filter"
          >
            Filter
          </button>
        </div>
        <KanbanFilterDialog
          open={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          selected={priorityFilter}
          onChange={setPriorityFilter}
          showOverdueOnly={showOverdueOnly}
          setShowOverdueOnly={setShowOverdueOnly}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          allTags={Array.from(new Set(cards.flatMap((c) => c.tags || []))).sort()}
        />
        <div className="flex gap-4 min-h-[60vh]">
          {columns.map((col) => {
            // Apply global filters
            let colCardsAll = cards.filter((c) => c.status === col.id);
            if (showOverdueOnly) {
              const now = new Date();
              colCardsAll = colCardsAll.filter((c) => c.dueAt && new Date(c.dueAt) < now && c.status !== 'done');
            }
            if (tagFilter.length > 0) {
              colCardsAll = colCardsAll.filter((c) => (c.tags || []).some((tag) => tagFilter.includes(tag)));
            }
            const colCards = priorityFilter.length > 0
              ? colCardsAll.filter((c) => priorityFilter.includes(c.priority))
              : colCardsAll;
            return (
              <div
                key={col.id}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setDragOverCol(col.id);
                }}
                onDragLeave={() => {
                  setDragOverCol((current) => (current === col.id ? null : current));
                }}
                onDrop={() => handleDrop(col.id)}
                className={"flex-1 " + (dragOverCol === col.id ? "ring-2 ring-primary ring-offset-2" : "")}
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
                        onClick={() => {
                          setEditTodo(card);
                          setEditDialogOpen(true);
                        }}
                        className="cursor-pointer"
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
      <KanbanEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        todo={editTodo}
        onSave={async (updated: Partial<Todo>) => {
          if (!editTodo) return;
          await state.patch(editTodo.id, editTodo.version, updated);
        }}
      />
    </>
  );
}

