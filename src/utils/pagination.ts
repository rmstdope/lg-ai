export interface PagingInput { page?: number; pageSize?: number; }
export interface PagingResult { page: number; pageSize: number; limit: number; offset: number; }

export function normalizePaging({ page, pageSize }: PagingInput): PagingResult {
  const p = !page || page < 1 ? 1 : Math.floor(page);
  const psRaw = !pageSize || pageSize < 1 ? 10 : Math.floor(pageSize);
  const ps = psRaw > 100 ? 100 : psRaw;
  return { page: p, pageSize: ps, limit: ps, offset: (p - 1) * ps };
}
