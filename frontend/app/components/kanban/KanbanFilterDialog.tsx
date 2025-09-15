import React from "react";

interface KanbanFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: number[];
  onChange: (selected: number[]) => void;
  showOverdueOnly: boolean;
  setShowOverdueOnly: (val: boolean) => void;
  tagFilter: string[];
  setTagFilter: (tags: string[]) => void;
  allTags: string[];
}

const PRIORITIES = [1, 2, 3, 4, 5];

export function KanbanFilterDialog({ open, onOpenChange, selected, onChange, showOverdueOnly, setShowOverdueOnly, tagFilter, setTagFilter, allTags }: KanbanFilterDialogProps) {
  function handleReset() {
    onChange([]);
    setShowOverdueOnly(false);
    setTagFilter([]);
  }
  function togglePriority(priority: number) {
    if (selected.includes(priority)) {
      onChange(selected.filter((p) => p !== priority));
    } else {
      onChange([...selected, priority]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[200px] max-w-[340px] w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filter Tasks</h3>
          <button className="text-gray-400 hover:text-gray-700" onClick={() => onOpenChange(false)}>&times;</button>
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={() => setShowOverdueOnly(!showOverdueOnly)}
            />
            <span>Show only overdue tasks</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-2">Priorities:</div>
              <div className="flex flex-col gap-2">
                {PRIORITIES.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(p)}
                      onChange={() => togglePriority(p)}
                    />
                    <span>Priority {p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Tags:</div>
              <div className="flex flex-wrap gap-1">
                {allTags.length === 0 ? (
                  <span className="text-muted-foreground text-xs">No tags found</span>
                ) : (
                  allTags.map((tag) => {
                    const selected = tagFilter.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={
                          `px-2 py-1 rounded-full border text-xs transition-colors ` +
                          (selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-muted-foreground hover:bg-primary/10")
                        }
                        onClick={() =>
                          selected
                            ? setTagFilter(tagFilter.filter((t) => t !== tag))
                            : setTagFilter([...tagFilter, tag])
                        }
                        aria-pressed={selected}
                      >
                        {tag}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 border"
            onClick={handleReset}
            type="button"
          >
            Reset Filter
          </button>
          <button
            className="px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
