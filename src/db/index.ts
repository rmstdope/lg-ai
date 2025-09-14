import Database from 'better-sqlite3';
import { DB_FILE, ensureDataDir } from '../config';

const { isNewFile } = ensureDataDir();

export const db = new Database(DB_FILE, { fileMustExist: false });

// PRAGMAs for reliability/performance tradeoffs.
['PRAGMA foreign_keys = ON', 'PRAGMA journal_mode = WAL', 'PRAGMA synchronous = NORMAL'].forEach(sql => {
  db.exec(sql);
});

export type DB = InstanceType<typeof Database>;

export function withTx<T>(fn: (db: DB) => T): T {
  const tx = db.transaction((..._args: unknown[]) => fn(db));
  return tx();
}

export { isNewFile };
