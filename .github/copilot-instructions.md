# AGENTS.md

Purpose: Precise, agent-focused instructions for working on this repository (backend Express API + React frontend). Humans can read `README.md`; use this file for build, run, style, and change guidelines.

## Project Overview (for agents)

- Two Node.js projects: backend at repo root (`src/`), frontend in `frontend/`.
- Backend: Express 5 + better-sqlite3 + TypeScript. Entry: `src/server.ts` (dev) / `dist/server.js` (prod after build).
- Frontend: React 19 + React Router + Vite + shadcn/ui (Radix primitives + Tailwind classes).
- SQLite database file at `data/app.db` (created/migrated automatically on first backend start). Seed only on first creation.
- Port defaults: backend `3000` (configurable via `PORT` env var), frontend Vite dev server (commonly `5173`, auto‑assigned if taken).

## Core Commands

Run in repo root (backend):

- Install deps: `npm install`
- Dev server (watch mode): `npm run dev`
- Type check: `npm run check`
- Build: `npm run build`
- Start built server: `npm start`
- Reseed data (idempotent-ish, only adds seed set if empty/new): `npm run db:seed`

Run in `frontend/`:

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview prod build: `npm run preview`
- Type check: `npm run typecheck`

Assume Node 24 (install via `nvm install 24`). If version mismatch errors appear, prefer upgrading the local runtime rather than downgrading dependencies.

## File / Directory Conventions

Backend (`/src`):

- `db/` handles migration (`migrate.ts`), seed (`seed.ts`), and database open logic (`index.ts`).
- `routes/` holds Express routers (e.g. `todos.ts`). Add new route modules here and mount in `src/server.ts`.
- `utils/` contains helpers (`errors.ts`, `pagination.ts`, `validate.ts`). Reuse utilities; don't re‑implement validation/pagination.
- `types.ts` houses shared backend types.

Frontend (`/frontend/app`):

- `routes/` page-level route components (e.g. `todos.tsx`).
- `components/` feature components (e.g. `todos/` folder for Todo UI pieces) and generic UI primitives in `ui/`.
- `lib/` utilities, API client (`lib/api/todos.ts`), hooks (`hooks/useTodos.ts`), types (`types/todo.ts`). Prefer calling the API via these helpers, not ad‑hoc fetches.

## Database & Migration Behavior

- On backend startup: `migrate()` runs; if DB file newly created, `seed()` executes.
- To reset DB during development: stop server, delete `data/app.db` plus sidecars (`app.db-wal`, `app.db-shm`), restart server.
- Avoid writing migration logic that depends on live application state—keep migrations idempotent.

## API Surface (Todos)

Routes defined in `src/routes/todos.ts`. Features: CRUD + pagination + basic validation + status/priority/due date fields.
Agents adding API features SHOULD:

1. Extend validation/utilities rather than inline logic.
2. Update types used by frontend API client if response shape changes.
3. Provide backward compatibility where feasible; otherwise increment response contract carefully.

## Code Style & Quality

Backend TypeScript (`tsconfig.json`):

- `strict: true` enforced.
- CommonJS modules; use `import` syntax (esModuleInterop enabled).
  Frontend TypeScript:
- `strict: true`; `moduleResolution: bundler`; React JSX runtime.
  General style:
- Prefer single quotes (existing code uses mixed quoting; keep consistent within touched file, convert opportunistically but don't churn).
- Semicolons currently present; retain existing style (do not mass-remove).
- Functional patterns & pure helpers preferred. Keep side effects in route handlers or explicit functions.
- Centralize error handling through `errorMiddleware` and `utils/errors.ts` patterns.

## Adding shadcn/ui Components

- Existing primitives live under `frontend/app/components/ui/`.
- When adding a new component from shadcn/ui generator, place it consistently and avoid duplicating existing variants.
- Reuse utility `cn` (if present in `utils.ts`) for class merging instead of reimplementing.

## Frontend Data Flow

- Use `useTodos` hook for Todo state; extend it for new fields rather than creating parallel fetch logic.
- Pagination, filters, and status/priority badges already implemented—follow their patterns.

## Error Handling & Validation

- Throw structured errors or use helper functions in `utils/errors.ts` (inspect existing patterns before altering).
- Input validation should live in `validate.ts` or adjacent dedicated helpers—avoid embedding schema logic inline.

## Performance Considerations

- SQLite + better-sqlite3 is synchronous; keep heavy loops minimal inside request handlers.
- For batch operations, consider wrapping DB work in a single transaction (extend current db helper if needed).

## Testing

Backend:

- Run all backend tests: `npm run test`
- Watch mode: `npm run test:watch`
- Tests live alongside source (e.g. `src/routes/todos.test.ts`).
- Node environment (no jsdom required for API tests).

Frontend:

- From `frontend/`: `npm run test` or `npm run test:watch`.
- JSDOM environment configured in `frontend/vitest.config.ts` with setup file `vitest.setup.ts` (adds jest-dom matchers).
- Tests colocated with components (e.g. `app/components/todos/TodoCard.test.tsx`).

Coverage:

- Basic coverage reporters (text, html) enabled; html output appears in `coverage/` once generated.

Adding new tests:

- Prefer colocating `*.test.ts` or `*.test.tsx` near implementation.
- For backend HTTP tests, use `supertest` against `createApp()` without starting a network listener.
- For frontend component tests, mock network calls at the API client layer if needed.

## Typical Agent Tasks & Expectations

When modifying API:

- Update route handler + types + frontend API client + UI components impacted.
- Provide migration if schema change (add new column default values) without breaking existing rows.

When adding a UI feature:

- Create or extend a component; ensure accessibility (follow Radix patterns).
- Keep styles utility-driven; avoid inline large style objects.

When adjusting build or scripts:

- Ensure `npm run dev` still functions for both backend & frontend.
- Avoid introducing a monorepo tool (pnpm workspaces, turbo) unless explicitly requested.

## Commit / PR Style (Agent Guidance)

- Group logically related changes; avoid drive-by formatting.
- If adding dependencies, explain necessity in commit message body.
- Mention breaking API changes clearly: `BREAKING:` prefix.

## Environment Variables

- `PORT`: optional, overrides backend port (default 3000).
- `DB_FILE`: optional, custom path to SQLite db. Ensure directory exists (startup code handles creation).
  Add new env vars to this section when introduced.

## Security Notes

- CORS currently allows all origins dynamically (echoes request origin). If tightening, document new rules here.
- No auth layer; adding one requires updating frontend fetch logic and likely introducing tokens or sessions.

## Troubleshooting (Agents)

- Port conflicts: choose another `PORT` env var or terminate conflicting process.
- Type errors after dependency changes: reinstall modules (`rm -rf node_modules package-lock.json && npm install`).
- Stale DB schema: delete DB file(s) and restart.
- Frontend cannot reach backend: confirm backend running and network origin matches `http://localhost:3000`.

## Adding Tests (Template Steps)

If implementing tests, proposed minimal additions:

1. Install: `npm install -D vitest supertest @types/supertest` (root)
2. Add script to root `package.json`: `"test": "vitest run"`
3. Create `src/__tests__/todos.test.ts` with basic CRUD flow.
4. Update this file's Testing section.

## Large Changes Policy

For schema or contract shifts:

1. Add backward-compatible fields first.
2. Migrate + deploy.
3. Remove deprecated usage in a follow-up change.

## Do Not

- Introduce unused dependencies.
- Reformat entire files unrelated to change.
- Duplicate logic present in utilities.

## Future Enhancements (Candidate List)

- Auth layer (JWT/session) & user-scoped todos
- Server-side filtering/sorting expansions
- Optimistic updates in frontend
- Test suite integration
- Docker orchestration for combined dev run

## Precedence Rules

- Explicit user instructions in a chat > this AGENTS.md > README.md.
- For conflicting guidance within AGENTS.md, prefer the section closest in scope (e.g. API section over generic style section for route handler questions).

## Updating This File

- Keep sections concise; add new headings for substantial domains (auth, tests) instead of bloating existing ones.
- Reflect any new scripts, env vars, or architectural patterns immediately after introduction.

---

This file is intentionally pragmatic; extend as the project grows.
