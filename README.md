# lg-ai

A small full‑stack TypeScript playground showing a Todo list with an Express + SQLite backend and a modern React (Vite + React Router) frontend using the shadcn/ui component primitives (Radix + Tailwind).

> Audience: Developers who can read code but are (re)starting with Node.js & React. You understand components conceptually but are new to the tooling.

## 1. Tech Stack

Backend:

- Node.js 24 (run via tsx in dev)cd
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

## 8. Using shadcn/ui Components

Components are added one at a time (scaffold already initialized). To add more:

1. Follow https://www.shadcn.io/docs components guide.
2. Generate/import the component into `frontend/app/components/ui` (or appropriate folder).
3. Use within route or feature components.

Already included: buttons, dialogs, forms, badges, pagination, etc. See existing Todo UI for examples of composition + theming.

## 9. Client Development (Routes, Components, Data Fetching)

This section expands on how to work inside the `frontend/` app.

### 9.1 Adding a New Route/Page

Routes are configured in `frontend/src/main.tsx` using `createBrowserRouter` and nested under the root layout (`app/root.tsx`). To add a route (example: `/projects`):

1. Create a component file: `frontend/app/routes/projects.tsx` exporting a React component.
2. Import it in `frontend/src/main.tsx`.
3. Add a route object entry: `{ path: "projects", element: <ProjectsRoute /> }` inside the `children` array.
4. (Optional) Add a nav link in `TopNavBar` (`frontend/app/components/top-nav-bar.tsx`).

Example skeleton:

```tsx
// frontend/app/routes/projects.tsx
export default function ProjectsRoute() {
  return <div className="p-4">Projects coming soon…</div>;
}
```

### 9.2 Where Components Live

- Reusable presentational UI primitives: `frontend/app/components/ui/` (buttons, dialogs, badges, etc.).
- Feature-specific components (domain logic + UI): place inside a folder under `frontend/app/components/` (e.g. `todos/`, `projects/`).
- Hooks: `frontend/app/lib/hooks/`.
- API clients: `frontend/app/lib/api/`.
- Types & DTO helpers: `frontend/app/lib/types/`.
  Keep domain separation: don't intermix feature components inside `ui/` (reserve it for generic primitives).

### 9.3 Adding New shadcn/ui Components

The project is already initialized. To pull in a new component (example: `accordion`):

```bash
npx shadcn@latest add accordion
```

This generates files (usually under `components/ui`) which you should then move/organize if needed to match existing naming. After generation:

- Ensure imports use relative paths consistent with existing components.
- If a utility like `cn` is duplicated, deduplicate and reuse existing one (check `frontend/app/lib/utils.ts` or similar).

### 9.4 Styling & Theming

Theme toggling is handled by `ThemeProvider` in `app/root.tsx`. Use Tailwind utility classes and existing variant helpers (e.g. `button` component) rather than ad‑hoc inline styles.

### 9.5 Tailwind CSS Basics

Tailwind is imported directly in `frontend/app/app.css` using the new v4 `@import "tailwindcss";` syntax plus `tw-animate-css` for animations. Theme tokens (colors, radius, etc.) are declared as CSS custom properties (OKLCH color space) and mapped via the `@theme` blocks.

Key points:

- Dark mode: toggled by adding/removing the `dark` class on `<html>` (handled by `ThemeProvider`). Use `dark:` variants in class names (e.g. `bg-card dark:bg-card` is often already covered by CSS variables, so prefer variables first).
- Color & spacing: Prefer semantic variables through existing component classes instead of hardcoding arbitrary values unless prototyping.
- Composition: Use utility-first approach (`flex gap-2 items-center`) and extract repeating patterns into small components rather than custom global CSS.
- Animation: Utilities from `tw-animate-css` can be applied as classes (e.g. `animate-fade-in`).

Common patterns:

```tsx
<div className="p-4 md:p-6 bg-card rounded-lg shadow-sm border border-border">Content</div>

<button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
   Save
</button>

<div className="flex flex-col sm:flex-row gap-4">
   <aside className="w-full sm:w-64 space-y-2">Sidebar</aside>
   <main className="flex-1">Main</main>
</div>
```

Customizing theme tokens:

- Edit CSS variables in `app/app.css` under `:root` and `.dark` blocks.
- Add new semantic tokens (e.g. `--color-warning`) then map them inside `@theme inline` if you want Tailwind to expose variants.

Responsive & state variants:

- Use standard Tailwind prefixes: `sm: md: lg: xl:` for breakpoints, `hover: focus: disabled:` for states, `aria-[expanded=true]:` for ARIA-based styling (Radix components often expose these attributes).

Helpful resources:

- Docs: https://tailwindcss.com/docs
- Shadcn + Tailwind patterns: https://ui.shadcn.com
- Color tuning (OKLCH): https://oklch.com/

If you find repeated multi-class combinations across components, consider a helper using `clsx` or `class-variance-authority` rather than adding bespoke CSS.

### 9.5 Fetching Data from the Backend

Centralize HTTP calls through API client modules (e.g. `frontend/app/lib/api/todos.ts`). Do NOT call `fetch()` directly in route components unless prototyping—add a small wrapper instead for consistency & error handling.

Pattern:

1. Define request/response types in `lib/types/` (see `types/todo.ts`).
2. Implement API functions in `lib/api/<entity>.ts`.
3. Create/extend a hook in `lib/hooks/` to encapsulate loading state, errors, optimistic updates.
4. Use the hook inside route / feature components.

### 9.6 Creating a New Entity Frontend Flow (Projects Example)

1. Backend: create table + repo + routes (`projects`).
2. Frontend: add types `frontend/app/lib/types/project.ts`.
3. Add API client `frontend/app/lib/api/projects.ts` (mirror todos structure).
4. Add hook `useProjects.ts` for list/create/update/delete with optimistic patterns (copy `useTodos.ts` as a starting point and prune fields).
5. Build UI components under `frontend/app/components/projects/` (e.g. `ProjectList.tsx`, `ProjectCard.tsx`).
6. Wire route `projects.tsx` using the hook and components.

### 9.7 Optimistic Updates

`useTodos` demonstrates optimistic create/update/delete:

- Insert temporary item with synthetic id for create.
- Apply patch locally then rollback on failure.
- Remove locally then undo on delete failure.
  Replicate this approach for new entities to keep UX responsive.

### 9.8 Error Handling

API errors are normalized into `ApiError` objects. Hooks set `error` state that components can render. Provide friendly UI states (loading skeletons, empty states, error messages) similar to existing Todo components (`frontend/app/components/todos/EmptyState.tsx`, etc.).

### 9.9 Pagination & Filtering

Use a single source of truth list hook (like `useTodos`) to manage filters. Debounce search inputs (see debounce logic in the hook) instead of uncontrolled firing on each keystroke.

### 9.10 Form Components

Reuse existing dialog + form patterns shown in `TodoFormDialog.tsx`. For new entities, duplicate structurally but extract truly generic parts over time rather than prematurely abstracting.

### 9.11 Performance Tips

- Avoid unnecessary re-renders: memoize derived arrays or heavy computations.
- Keep large lists virtualized if they grow (could introduce a virtualization lib later; currently small scale so not included).

### 9.12 Testing (Future)

When a test setup is introduced (e.g. Vitest + React Testing Library), colocate tests next to components (`ComponentName.test.tsx`) or in a `__tests__` folder. Aim to test hooks in isolation and route rendering with mocked API modules.

### 9.13 Common Pitfalls

- Forgetting to update router when adding a new route component.
- Duplicating API base URLs—keep a single `BASE_URL` or consider an env var later.
- Importing from deep relative paths when an alias (`~/*`) exists (prefer the alias for app code).

## 10. Development Workflow Tips

- Type checking backend: `npm run check` (root)
- Type checking frontend: `npm run typecheck` (inside `frontend`)
- Backend build (emit JS): `npm run build` (root) then `npm start`
- Frontend production build: `npm run build` (inside `frontend`), preview with `npm run preview`
- DB seed (re-run manually if needed): `npm run db:seed` (root) – note it won't drop existing rows; adapt as needed.

### 10.1 Testing

Backend tests (Vitest + Supertest) live alongside backend source (e.g. `src/routes/todos.test.ts`). Run:

```bash
npm run test        # one-off
npm run test:watch  # watch mode
```

Frontend tests (Vitest + React Testing Library) are colocated with components (e.g. `app/components/.../*.test.tsx`). From `frontend/` directory:

```bash
npm run test
npm run test:watch
```

JSDOM + jest-dom matchers are configured in `frontend/vitest.config.ts` and `frontend/vitest.setup.ts`.
Add tests for new routes, hooks, and UI states (loading, empty, error) as you extend the project.

## 11. Troubleshooting

Port in use (3000): find the process (macOS) `lsof -i :3000` then kill it.
Frontend cannot reach API: ensure backend running; check CORS headers (already permissive). Confirm network tab requests go to `http://localhost:3000`.
Database issues: delete the file `data/app.db` (and `-wal`, `-shm` sidecars) then restart backend to recreate & reseed.
Node version errors: run `nvm use 24` or reinstall Node 24.
Type errors after dep changes: delete `node_modules` + run `npm install` again.

## 12. Next Steps / Ideas

- Add user auth (JWT or session)
- Add filtering / sorting server-side
- Add tests (unit & API) with a lightweight runner (e.g. vitest or jest + supertest)
- Dockerize full stack (frontend already has a Dockerfile)
- Implement optimistic UI updates
- Add E2E tests (Playwright) for Todo flows

## 13. FAQ (Quick)

Q: Where do I add new API routes?  
A: Create a new router in `src/routes/` and mount it in `src/server.ts`.

Q: How do I add a new page in the frontend?  
A: Create a route component in `frontend/app/routes/` and register it with React Router (see existing routes for pattern).

---

Happy hacking! Open issues or PRs to iterate further.
