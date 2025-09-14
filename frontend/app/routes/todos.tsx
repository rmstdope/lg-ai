import { useState } from "react";
import { useTodos } from "~/lib/hooks/useTodos";
import { TodoListToolbar } from "~/components/todos/TodoListToolbar";
import { TodoList } from "~/components/todos/TodoList";
import { PaginationBar } from "~/components/todos/PaginationBar";
import { TodoFormDialog } from "~/components/todos/TodoFormDialog";
import { ConfirmDeleteDialog } from "~/components/todos/ConfirmDeleteDialog";
import { ConflictNotice } from "~/components/todos/ConflictNotice";
import type { Todo } from "~/lib/types/todo";
import { ApiError } from "~/lib/types/todo";

export default function TodosRoute() {
  const state = useTodos();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [conflict, setConflict] = useState<ApiError | null>(null);

  const openEdit = (id: string) => {
    const todo = state.items.find((t) => t.id === id);
    if (!todo) return; // might have disappeared
    setEditing(todo);
    setEditOpen(true);
  };

  const handleUpdate = async (id: string, version: number, patch: any) => {
    const updated = await state.patch(id, version, patch);
    if (!updated) {
      // detect conflict
      if (state.error?.status === 409) {
        setConflict(state.error);
      }
    } else {
      setConflict(null);
    }
    return updated;
  };

  const resolveConflict = (action: "view" | "overwrite" | "cancel") => {
    if (!conflict || !editing) return;
    if (action === "view") {
      // refetch single item pattern: rely on global refresh for now
      state.refresh();
      // After refresh pick updated editing item
      const fresh = state.items.find((t) => t.id === editing.id);
      if (fresh) setEditing(fresh);
      setConflict(null);
    } else if (action === "overwrite") {
      // attempt update again with latest version if we have it
      const fresh = state.items.find((t) => t.id === editing.id);
      if (fresh) {
        // Reapply previous edits by diffing editing vs fresh
        const patch: any = {};
        if (editing.title !== fresh.title) patch.title = editing.title;
        if ((editing.description || "") !== (fresh.description || ""))
          patch.description = editing.description ?? null;
        if (editing.priority !== fresh.priority)
          patch.priority = editing.priority;
        if (editing.status !== fresh.status) patch.status = editing.status;
        if ((editing.dueAt || "") !== (fresh.dueAt || ""))
          patch.dueAt = editing.dueAt ?? null;
        if (JSON.stringify(editing.tags) !== JSON.stringify(fresh.tags))
          patch.tags = editing.tags;
        state.patch(fresh.id, fresh.version, patch);
      }
      setConflict(null);
    } else if (action === "cancel") {
      setConflict(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <TodoListToolbar state={state} onOpenCreate={() => setCreateOpen(true)} />
      <TodoList
        state={state}
        onEdit={(id) => openEdit(id)}
        onCreateRequest={() => setCreateOpen(true)}
      />
      <PaginationBar
        page={state.page}
        pageSize={state.pageSize}
        total={state.total}
        onPageChange={(p) => state.setPage(p)}
      />

      <TodoFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={state.create}
        onUpdate={() => Promise.resolve(null)}
        busy={state.creating}
      />
      <TodoFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        onCreate={() => Promise.resolve(null)}
        onUpdate={handleUpdate}
        initial={editing || undefined}
        busy={editing ? state.updatingIds.has(editing.id) : false}
        conflictError={conflict || undefined}
        onResolveConflict={resolveConflict}
      />
      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        onConfirm={async () => {
          if (deleteId) {
            await state.remove(deleteId);
            setDeleteId(null);
          }
        }}
        busy={deleteId ? state.deletingIds.has(deleteId) : false}
      />
    </div>
  );
}
