import { withTx, db, type DB } from './index';

const SCHEMA_SQL = `
DROP TABLE IF EXISTS todo_tags;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','archived')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  due_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  assignee INTEGER,
  FOREIGN KEY (assignee) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (todo_id, tag),
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_due_at ON todos(due_at);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at);
CREATE INDEX IF NOT EXISTS idx_todos_assignee ON todos(assignee);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON todo_tags(tag);
`;

export function migrate(db: DB, _opts: { isNewFile: boolean }) {
  db.exec(SCHEMA_SQL);
}

if (require.main === module) {
  migrate(db, { isNewFile: false });
  console.log('DB migrated');
}
