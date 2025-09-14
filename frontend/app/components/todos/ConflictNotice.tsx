import { ApiError } from "~/lib/types/todo";

interface ConflictNoticeProps {
  error: ApiError;
  onViewServer: () => void;
  onOverwrite: () => void;
  onCancel: () => void;
}

export function ConflictNotice({
  error,
  onViewServer,
  onOverwrite,
  onCancel,
}: ConflictNoticeProps) {
  if (error.status !== 409) return null;
  return (
    <div
      role="alert"
      className="border border-destructive rounded-md p-4 space-y-3 bg-destructive/5"
    >
      <div className="text-sm font-medium text-destructive">
        This todo was modified on the server.
      </div>
      <p className="text-xs text-muted-foreground">
        Choose how to resolve the conflict.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onViewServer}
          className="px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted"
        >
          View server copy
        </button>
        <button
          type="button"
          onClick={onOverwrite}
          className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Overwrite anyway
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
