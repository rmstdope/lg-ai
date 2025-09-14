import { useEffect } from "react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => Promise<void> | void;
  busy?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: ConfirmDeleteDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-sm bg-card border rounded-md p-6 space-y-4 shadow-lg">
        <h3 className="font-semibold text-lg">Delete todo</h3>
        <p className="text-sm text-muted-foreground">
          Delete this todo? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border text-sm"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
