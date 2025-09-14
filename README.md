# lg-ai

A small full‑stack TypeScript playground showing a Todo list with an Express + SQLite backend and a modern React (Vite + React Router) frontend using the shadcn/ui component primitives (Radix + Tailwind).

> Audience: Developers who can read code but are (re)starting with Node.js & React. You understand components conceptually but are new to the tooling.

## 1. Tech Stack

Backend:
- Node.js 24 (run via tsx in dev)
- Express 5 (beta line)
- better-sqlite3 for a file‑backed SQLite DB
- TypeScript

Frontend:
- React 19 + React Router
- Vite dev server
- shadcn/ui (Radix UI primitives + Tailwind styling utilities)
- Utility libs: class-variance-authority, clsx, date-fns, lucide-react

## 2. Prerequisites

Install Node via `nvm` (Node Version Manager) so you can easily use the required version.

1. Install nvm (follow instructions): https://github.com/nvm-sh/nvm
2. Install Node 24 (latest minor of major 24):
   ```bash
   nvm install 24
   nvm alias default 24
   ```
3. Open a new shell (or `nvm use 24`) and verify:
   ```bash
   node -v   # should start with v24
   npm -v
   ```

## 3. Project Structure (high‑level)

```
/ (repo root)
  package.json        <- Backend & shared dev scripts
  src/                <- Express server, DB, routes
  data/               <- SQLite database file (created on first run)
  frontend/           <- React app (Vite + shadcn/ui)
    package.json      <- Frontend scripts & deps
    app/              <- Routes, components, UI building blocks
```

Key backend files:
- `src/server.ts` creates Express app, mounts Todo routes, sets CORS
- `src/routes/todos.ts` REST endpoints for todos
- `src/db/` migration + seed logic
- `src/config.ts` config & port (defaults to 3000)

Key frontend bits:
- `frontend/app/routes/` route components (e.g. `todos.tsx`)
- `frontend/app/lib/api/` API helper for fetching todos
- `frontend/app/components/` UI components (including Todo list UI)

## 4. Install Dependencies

You must install in BOTH the root and the `frontend` folder (they are separate Node projects):

```bash
# From repo root
npm install

# Then install frontend deps
cd frontend
npm install
```

## 5. Running the Apps

Terminal 1 – backend (from repo root):
```bash
npm run dev
```
Starts Express with tsx in watch mode on http://localhost:3000.

First run will:
- Ensure `data/` exists
- Run DB migrations
- Seed initial Todo data (only if DB file is new)

Terminal 2 – frontend:
```bash
cd frontend
npm run dev
```
Vite will print the dev server address (commonly http://localhost:5173). Open it in the browser. The frontend talks to the backend API at `http://localhost:3000`.

Both processes watch for file changes: edit TypeScript/TSX and refresh happens automatically.

## 6. Todo API (Quick Glance)

The backend exposes basic CRUD routes for todos (see `src/routes/todos.ts`). Typical endpoints include listing, creating, updating, and deleting todos. Pagination & basic validation utilities are included.

## 7. Working with the Database (Adding Tables, Seeding, Repos)

The backend uses SQLite via `better-sqlite3` (synchronous, fast for local dev). Schema creation and seeding happen automatically on first run.

### 7.1 Schema & Migrations
There is a single migration step implemented in `src/db/migrate.ts` which executes a block of SQL (`SCHEMA_SQL`). For small playground projects this is fine; if you expand, you can evolve this into incremental migrations.

To add a new table:
1. Open `src/db/migrate.ts`.
2. Append a new `CREATE TABLE IF NOT EXISTS ...` statement (and any indexes / foreign keys). Keep it inside the `SCHEMA_SQL` string.
3. If you need to alter an existing table (e.g. add a column), add a safe statement such as:
    ```sql
    ALTER TABLE your_table ADD COLUMN new_col TEXT; -- Only if not already present
    ```
    SQLite doesn't have `IF NOT EXISTS` for columns; you can guard by first trying a `PRAGMA table_info(your_table)` check in code if you want to be defensive. For this simple project you can delete `data/app.db` to recreate from scratch instead.
4. Restart the backend (`npm run dev`). The migration runs at process start.

Quick recreate (destructive):
```bash
rm data/app.db data/app.db-wal data/app.db-shm 2>/dev/null || true
npm run dev
```

### 7.2 Seeding Data
Seeding logic lives in `src/db/seed.ts` and only runs automatically if the DB file is brand new (see `src/server.ts` order: `migrate` then `seed` when `isNewFile` is true).

To modify seed data:
1. Edit the `seedTodos` array in `seed.ts`.
2. Delete the existing DB file(s) (see recreate snippet above).
3. Restart backend.

To add seed logic for a new table, inside the existing `withTx` block add statements after ensuring the table exists via migration.

Manual reseed without deleting (adds items; won’t wipe existing):
```bash
npm run db:seed
```

### 7.3 Repository Pattern
Business/database access for todos is encapsulated in `src/repo/todos.ts`. Routes import functions from that file instead of running raw SQL.

Why:
- Centralizes SQL
- Keeps route handlers focused on HTTP concerns (parsing query/body, status codes)
- Enables easier future refactors (e.g. swap DB layer)

Pattern Highlights (`todos` repo):
- `list(params)` builds dynamic filtering & pagination.
- `create(input)` wraps inserts in a transaction (`withTx`).
- `update(id, version, patch)` does optimistic concurrency by comparing `version` then incrementing.
- `remove(id)` performs a delete.

When adding a new entity (example: "projects"):
1. Add table & indexes in `migrate.ts`.
2. (Optional) Extend seed: push initial objects into new table.
3. Create `src/repo/projects.ts` with functions: `list`, `getById`, `create`, `update`, `remove` mirroring the todo repo style. Export typed interfaces for inputs.
4. Add a new route file `src/routes/projects.ts` that imports repo functions and handles HTTP specifics (query parsing, validation, status codes). Mount it in `src/server.ts` via `app.use(projectsRouter)`.
5. If the frontend needs it, add API helpers in `frontend/app/lib/api/` and types in `frontend/app/lib/types/` (or reuse existing pattern at `frontend/app/lib/api/todos.ts`).

### 7.4 Transactions
Use `withTx(fn)` from `src/db/index.ts` when multiple statements must succeed or fail together (e.g. inserting a parent row and child tag rows). Keep DB writes minimal inside the transaction body.

### 7.5 Concurrency / Versioning
The `todos` table has a `version` column incremented on each update. Routes require clients to send `If-Match: <version>` header for PATCH. If you add versioning to new tables, replicate this approach:
1. Add `version INTEGER NOT NULL DEFAULT 1` column.
2. On update: append `version = version + 1` and compare the current row's `version` before updating.
3. On conflict: throw or return 409 with current resource state.

### 7.6 Adding Indexes
When you introduce new query patterns (filtering/sorting), add appropriate indexes in `migrate.ts` using `CREATE INDEX IF NOT EXISTS`. Favor indexes on columns used in WHERE clauses or ORDER BY for large result sets.

### 7.7 Evolving Beyond Single File Migration
If schema churn increases, migrate toward incremental files:
```
src/db/migrations/
   001-init.sql
   002-add-projects.sql
   003-add-project-tags.sql
```
Track an `applied_migrations` table and apply those not yet recorded. For now, simplicity wins.

## 7. Using shadcn/ui Components

Components are added one at a time (scaffold already initialized). To add more:
1. Follow https://www.shadcn.io/docs components guide.
2. Generate/import the component into `frontend/app/components/ui` (or appropriate folder).
3. Use within route or feature components.

Already included: buttons, dialogs, forms, badges, pagination, etc. See existing Todo UI for examples of composition + theming.

## 8. Development Workflow Tips

- Type checking backend: `npm run check` (root)
- Type checking frontend: `npm run typecheck` (inside `frontend`)
- Backend build (emit JS): `npm run build` (root) then `npm start`
- Frontend production build: `npm run build` (inside `frontend`), preview with `npm run preview`
- DB seed (re-run manually if needed): `npm run db:seed` (root) – note it won't drop existing rows; adapt as needed.

## 9. Troubleshooting

Port in use (3000): find the process (macOS) `lsof -i :3000` then kill it.
Frontend cannot reach API: ensure backend running; check CORS headers (already permissive). Confirm network tab requests go to `http://localhost:3000`.
Database issues: delete the file `data/app.db` (and `-wal`, `-shm` sidecars) then restart backend to recreate & reseed.
Node version errors: run `nvm use 24` or reinstall Node 24.
Type errors after dep changes: delete `node_modules` + run `npm install` again.

## 10. Next Steps / Ideas

- Add user auth (JWT or session)
- Add filtering / sorting server-side
- Add tests (unit & API) with a lightweight runner (e.g. vitest or jest + supertest)
- Dockerize full stack (frontend already has a Dockerfile)
- Implement optimistic UI updates
- Add E2E tests (Playwright) for Todo flows

## 11. FAQ (Quick)

Q: Where do I add new API routes?  
A: Create a new router in `src/routes/` and mount it in `src/server.ts`.

Q: How do I add a new page in the frontend?  
A: Create a route component in `frontend/app/routes/` and register it with React Router (see existing routes for pattern).

---
Happy hacking! Open issues or PRs to iterate further.
