import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
  ApiError,
} from "~/lib/types/todo";
import { isApiError } from "~/lib/types/todo";
import { TagChips } from "./TagChips";
import { ConflictNotice } from "./ConflictNotice";

interface TodoFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (input: CreateTodoInput) => Promise<Todo | null>;
  onUpdate: (
    id: string,
    version: number,
    patch: UpdateTodoInput
  ) => Promise<Todo | null>;
  initial?: Todo | null; // existing todo when editing
  busy?: boolean; // create or update in-flight
  conflictError?: ApiError | null;
  onResolveConflict?: (action: "view" | "overwrite" | "cancel") => void;
}

interface FieldErrors {
  [k: string]: string | undefined;
}

const TITLE_MAX = 200;
const DESC_MAX = 10000;
const TAG_MAX = 30;

export function TodoFormDialog(props: TodoFormDialogProps) {
  const {
    mode,
    open,
    onOpenChange,
    onCreate,
    onUpdate,
    initial,
    busy,
    conflictError,
    onResolveConflict,
  } = props;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);
  const [status, setStatus] = useState<Todo["status"]>("todo");
  const [dueAt, setDueAt] = useState<string | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Initialize on open
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initial) {
        setTitle(initial.title);
        setDescription(initial.description || "");
        setPriority(initial.priority);
        setStatus(initial.status);
        setDueAt(initial.dueAt || "");
        setTags(initial.tags);
      } else if (mode === "create") {
        setTitle("");
        setDescription("");
        setPriority(3);
        setStatus("todo");
        setDueAt("");
        setTags([]);
      }
      setFieldErrors({});
      setFormError(null);
      setTagInput("");
      // Focus first field shortly after mount
      setTimeout(() => firstFieldRef.current?.focus(), 10);
    }
  }, [open, mode, initial]);

  // Keyboard: esc close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const validate = useCallback((): boolean => {
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "Title required";
    if (title.length > TITLE_MAX) errs.title = `Max ${TITLE_MAX} chars`;
    if (description.length > DESC_MAX)
      errs.description = `Max ${DESC_MAX} chars`;
    tags.forEach((t) => {
      if (t.length > TAG_MAX) errs.tags = `Tag '${t}' too long`;
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [title, description, tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!validate()) return;
    try {
      if (mode === "create") {
        const created = await onCreate({
          title: title.trim(),
          description: description || undefined,
          priority,
          status,
          dueAt: dueAt || undefined,
          tags,
        });
        if (created) onOpenChange(false);
      } else if (mode === "edit" && initial) {
        const patch: UpdateTodoInput = {};
        if (title !== initial.title) patch.title = title.trim();
        if (description !== (initial.description || ""))
          patch.description = description || null;
        if (priority !== initial.priority) patch.priority = priority;
        if (status !== initial.status) patch.status = status;
        if ((dueAt || "") !== (initial.dueAt || ""))
          patch.dueAt = dueAt || null;
        if (JSON.stringify(tags) !== JSON.stringify(initial.tags))
          patch.tags = tags;
        if (Object.keys(patch).length === 0) {
          onOpenChange(false); // nothing changed
          return;
        }
        const updated = await onUpdate(initial.id, initial.version, patch);
        if (updated) onOpenChange(false);
      }
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
        if (err.fieldErrors)
          setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      } else {
        setFormError("Unexpected error");
      }
    }
  };

  const addTag = useCallback(() => {
    const raw = tagInput.trim();
    if (!raw) return;
    if (tags.includes(raw)) {
      setTagInput("");
      return;
    }
    setTags((t) => [...t, raw]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback(
    (tag: string) => setTags((t) => t.filter((x) => x !== tag)),
    []
  );

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

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
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-card border rounded-md p-6 space-y-5 shadow-lg overflow-y-auto max-h-[90vh]"
      >
        <h3 className="font-semibold text-lg">
          {mode === "create" ? "New Todo" : "Edit Todo"}
        </h3>
        {conflictError && (
          <ConflictNotice
            error={conflictError}
            onViewServer={() => onResolveConflict?.("view")}
            onOverwrite={() => onResolveConflict?.("overwrite")}
            onCancel={() => onResolveConflict?.("cancel")}
          />
        )}
        {formError && (
          <div role="alert" className="text-sm text-destructive">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" htmlFor="title">
              Title
            </label>
            <input
              ref={firstFieldRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 px-3 rounded-md border"
              required
              maxLength={TITLE_MAX}
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 px-3 py-2 rounded-md border resize-y"
              maxLength={DESC_MAX}
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">
                {fieldErrors.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Todo["status"])}
                className="h-9 px-2 rounded-md border"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-9 px-2 rounded-md border"
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" htmlFor="dueAt">
                Due
              </label>
              <input
                id="dueAt"
                type="date"
                value={dueAt ? dueAt.slice(0, 10) : ""}
                onChange={(e) => setDueAt(e.target.value)}
                className="h-9 px-2 rounded-md border"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" htmlFor="tags">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Press Enter to add"
                className="h-9 px-3 rounded-md border flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 h-9 rounded-md border text-xs"
              >
                Add
              </button>
            </div>
            <TagChips tags={tags} editable onRemove={removeTag} />
            {fieldErrors.tags && (
              <p className="text-xs text-destructive">{fieldErrors.tags}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border text-sm"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            disabled={busy}
          >
            {busy ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
