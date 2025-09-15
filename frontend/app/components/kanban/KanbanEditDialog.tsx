import React, { useState } from "react";
import type { Todo } from "~/lib/types/todo";

interface KanbanEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: Todo | null;
  onSave: (updated: Partial<Todo>) => void;
}

const PRIORITIES = [1, 2, 3, 4, 5];
const STATUSES = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "archived", label: "Archived" },
];

export function KanbanEditDialog({ open, onOpenChange, todo, onSave }: KanbanEditDialogProps) {
  const [form, setForm] = useState<Partial<Todo>>({});

  React.useEffect(() => {
    if (todo) setForm(todo);
  }, [todo]);

  if (!open || !todo) return null;

  function handleChange<K extends keyof Todo>(key: K, value: Todo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTagInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, tags: val.split(",").map((t) => t.trim()).filter(Boolean) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form
        className="bg-white rounded-lg shadow-lg p-6 min-w-[220px] max-w-[340px] w-full flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Edit Todo</h3>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={() => onOpenChange(false)}>&times;</button>
        </div>
        <label className="flex flex-col gap-1">
          Title
          <input
            className="border rounded px-2 py-1"
            value={form.title || ""}
            onChange={e => handleChange("title", e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Description
          <textarea
            className="border rounded px-2 py-1"
            value={form.description || ""}
            onChange={e => handleChange("description", e.target.value)}
            rows={3}
          />
        </label>
        <label className="flex flex-col gap-1">
          Due Date
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={form.dueAt ? String(form.dueAt).slice(0, 10) : ""}
            onChange={e => handleChange("dueAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </label>
        <label className="flex flex-col gap-1">
          Priority
          <select
            className="border rounded px-2 py-1"
            value={form.priority || 1}
            onChange={e => handleChange("priority", Number(e.target.value))}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>Priority {p}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Status
          <select
            className="border rounded px-2 py-1"
            value={form.status || "todo"}
            onChange={e => handleChange("status", e.target.value as Todo["status"])}
          >
            {STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Tags (comma separated)
          <input
            className="border rounded px-2 py-1"
            value={Array.isArray(form.tags) ? form.tags.join(", ") : ""}
            onChange={handleTagInput}
          />
        </label>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 border"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 border"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
