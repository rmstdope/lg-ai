import { ApiError } from '../types';
import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error implements ApiError {
  code: ApiError['code'];
  field?: string;
  current?: any; // used only for conflict scenario
  constructor(code: ApiError['code'], message: string, field?: string, extra?: Partial<ApiError>) {
    super(message);
    this.code = code;
    this.field = field;
    if (extra && 'current' in extra) this.current = (extra as any).current;
  }
}

export function httpError(code: ApiError['code'], message: string, field?: string, extra?: Partial<ApiError>): never {
  throw new HttpError(code, message, field, extra);
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    const body: ApiError = { code: err.code, message: err.message };
    if (err.field) body.field = err.field;
    if (err.code === 409 && err.current) body.current = err.current;
    res.status(err.code).json(body);
    return;
  }
  // Fallback
  console.error('Unhandled error', err);
  res.status(500).json({ code: 500, message: 'Internal server error' });
}
