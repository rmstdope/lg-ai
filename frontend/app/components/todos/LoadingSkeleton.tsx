export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-label="Loading todos" role="status">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border rounded-md p-4 flex flex-col gap-3"
        >
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
