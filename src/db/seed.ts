import { nowIso } from '../config';
import { withTx, db, type DB } from './index';
import crypto from 'crypto';

interface SeedTodo {
  title: string; description?: string; status?: string; priority?: number; dueAt?: string | null; tags?: string[];
}

const seedTodos: SeedTodo[] = [
  { title: 'Write project README', description: 'Document API usage and setup instructions', status: 'done', priority: 2, tags: ['docs','project'] },
  { title: 'Implement list endpoint', status: 'in_progress', priority: 1, tags: ['api','todos'] },
  { title: 'Add pagination', status: 'todo', priority: 3, tags: ['api','enhancement'] },
  { title: 'Refactor validation logic', status: 'todo', priority: 4, tags: ['tech_debt'] },
  { title: 'Prepare release notes', status: 'todo', priority: 3, dueAt: new Date(Date.now() + 86400000).toISOString(), tags: ['release','communication'] },
  { title: 'Fix production bug #123', status: 'in_progress', priority: 1, tags: ['bugfix','urgent'] },
  { title: 'Archive deprecated feature tasks', status: 'archived', priority: 5, tags: ['cleanup'] },
  { title: 'Plan Q4 roadmap', status: 'todo', priority: 2, dueAt: new Date(Date.now() + 7*86400000).toISOString(), tags: ['planning'] },
  { title: 'Overdue task example', status: 'todo', priority: 2, dueAt: new Date(Date.now() - 86400000).toISOString(), tags: ['overdue'] },
  { title: 'Finish optimistic concurrency', status: 'done', priority: 2, tags: ['api','consistency'] },
];

export function seed(database: DB = db) {
  withTx(() => {
    const now = nowIso();
    const insertTodo = database.prepare(`INSERT INTO todos (id,title,description,status,priority,due_at,created_at,updated_at,version) VALUES (?,?,?,?,?,?,?,?,1)`);
    const insertTag = database.prepare(`INSERT INTO todo_tags (todo_id, tag) VALUES (?,?)`);
    for (const t of seedTodos) {
      const id = crypto.randomUUID();
      insertTodo.run(id, t.title, t.description ?? null, t.status ?? 'todo', t.priority ?? 3, t.dueAt ?? null, now, now);
      if (t.tags) t.tags.forEach(tag => insertTag.run(id, tag));
    }
  });
}

if (require.main === module) {
  seed();
  console.log('DB seeded');
}
