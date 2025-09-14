export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="text-center py-16 border rounded-md">
      <p className="text-muted-foreground mb-4">No todos match your filters.</p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          Create your first todo
        </button>
      )}
    </div>
  );
}
