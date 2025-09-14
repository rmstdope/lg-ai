import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface TagChipsProps {
  tags: string[];
  editable?: boolean;
  onRemove?: (tag: string) => void;
}

export function TagChips({ tags, editable, onRemove }: TagChipsProps) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1" aria-label="Tags">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 rounded bg-secondary/40 dark:bg-secondary/30 text-xs px-2 py-0.5 text-secondary-foreground",
            editable && "pr-1"
          )}
        >
          {tag}
          {editable && (
            <button
              type="button"
              onClick={() => onRemove?.(tag)}
              aria-label={`Remove tag ${tag}`}
              className="hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
