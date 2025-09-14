interface PaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationBarProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div
      className="flex items-center justify-between py-4 text-sm"
      aria-label="Pagination"
    >
      <span className="text-muted-foreground">
        Showing {start}-{end} of {total}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded-md border disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={page >= maxPage}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded-md border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
