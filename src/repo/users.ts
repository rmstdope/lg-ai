import { db } from '../db';
import { User, UserRow, UserWithPassword } from '../types';

export function listUsers(): User[] {
  const rows = db.prepare('SELECT id, username FROM users').all() as UserRow[];
  return rows.map(row => ({ id: row.id, username: row.username }));
}

export function getUserById(id: number): User | undefined {
  const row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row ? { id: row.id, username: row.username } : undefined;
}

export function getUserByUsername(username: string): User | undefined {
  const row = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username) as UserRow | undefined;
  return row ? { id: row.id, username: row.username } : undefined;
}

// For internal use only (e.g. auth):
export function getUserWithPasswordByUsername(username: string): UserWithPassword | undefined {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;
  return row ? { id: row.id, username: row.username, password: row.password } : undefined;
}

export function createUser(username: string, password: string): User {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const info = stmt.run(username, password);
  return getUserById(info.lastInsertRowid as number)!;
}

export function deleteUser(id: number): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}
