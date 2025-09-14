// Lightweight relative date formatting (no external deps)
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);
  const dayMs = 86400000;
  const diffDays = Math.floor((date.getTime() - now.getTime()) / dayMs);

  // Within 7 days show relative (e.g., in 3d / 5h ago)
  if (Math.abs(diffDays) < 7) {
    if (absSec < 60) return diffSec >= 0 ? "in seconds" : "seconds ago";
    const absMin = Math.round(absSec / 60);
    if (absMin < 60) return diffSec >= 0 ? `in ${absMin}m` : `${absMin}m ago`;
    const absH = Math.round(absMin / 60);
    if (absH < 24) return diffSec >= 0 ? `in ${absH}h` : `${absH}h ago`;
    const absD = Math.round(absH / 24);
    return diffSec >= 0 ? `in ${absD}d` : `${absD}d ago`;
  }
  // Fallback ISO date
  return date.toISOString().slice(0, 10);
}
