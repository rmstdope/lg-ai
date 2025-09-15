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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 min-h-[60vh]">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.status === col.id);
          return (
            <KanbanColumn key={col.id} id={col.id} title={col.title} count={colCards.length}>
              {state.loading ? (
                <div className="text-muted-foreground text-sm">Loading...</div>
              ) : state.error ? (
                <div className="text-red-500 text-sm">{state.error.message}</div>
              ) : colCards.length === 0 ? (
                <div className="text-muted-foreground text-sm">No cards</div>
              ) : (
                colCards.map((card) => <KanbanCard key={card.id} todo={card} />)
              )}
            </KanbanColumn>
          );
        })}
      </div>
    </div>
  );
}
