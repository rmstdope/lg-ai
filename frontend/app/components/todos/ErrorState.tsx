import { ApiError } from "~/lib/types/todo";

export function ErrorState({
  error,
  onRetry,
}: {
  error: ApiError;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="border rounded-md p-6 text-center space-y-4">
      <div className="text-destructive font-medium">{error.message}</div>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
      >
        Retry
      </button>
    </div>
  );
}
