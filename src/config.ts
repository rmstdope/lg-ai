import fs from 'fs';
import path from 'path';

export const PORT: number = parseInt(process.env.PORT || '3000', 10);
export const DB_FILE: string = process.env.DB_FILE || path.resolve('./data/app.db');

export function ensureDataDir(): { isNewFile: boolean } {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const isNewFile = !fs.existsSync(DB_FILE);
  return { isNewFile };
}

export const nowIso = (): string => new Date().toISOString();
