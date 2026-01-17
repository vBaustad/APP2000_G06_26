# Copilot / AI Agent instructions for APP2000_G06_26 ⚙️

Short, focused guidance to get productive fast in this monorepo.

## Big picture
- Monorepo with two apps under `apps/`:
  - `apps/web` — React (Vite, TypeScript, Tailwind). Entry: `src/main.tsx` → `src/App.tsx` (React Router v7).
  - `apps/api` — Express (TypeScript). Entry: `src/index.ts` (server listens on port **4000**).
- Development runs both apps concurrently from repo root using workspace scripts (`npm run dev`) — front on **5173**, back on **4000**.

## First steps (how to run things)
- Install deps (root):
  - `npm install`
- Run both apps (root):
  - `npm run dev`
- Run just frontend or backend (from root):
  - `npm run dev:web` or `npm run dev:api`
- Build (root):
  - `npm run build` (runs `build:web` + `build:api`)
- Backend dev notes:
  - API dev uses `tsx watch src/index.ts` (see `apps/api/package.json`).
  - Build: `npm --workspace @app2000/api run build` then `npm --workspace @app2000/api run start` to run `dist/index.js`.

## Key integration points & conventions
- API base path: routes are mounted under `/api/*` (`apps/api/src/index.ts`). Example: `app.use('/api/users', userRouter)`.
- CORS is enabled in the API; in dev the frontend may call `http://localhost:4000/api/...` directly.
- Currently many frontend data flows use mocks (see `apps/web/src/utils/mockTours.ts` and `apps/web/src/services/toursApi.ts`). To integrate real APIs:
  - Add a new `apps/api/src/routes/toursRoutes.ts` and `app.use('/api/tours', toursRouter)` in `index.ts`.
  - Replace `toursApi.getTours()` to fetch `http://localhost:4000/api/tours` (or configurable base URL).

Example replace for `getTours`:
```ts
export async function getTours() {
  const res = await fetch('http://localhost:4000/api/tours');
  return res.json();
}
```

## Code & style patterns to follow
- UI: Tailwind CSS utility classes in `apps/web/src/styles/global.css` and `tailwind.config.ts`.
- Routing: React Router v7 with nested routes and `Layout` using `Outlet` (`apps/web/src/App.tsx`, `Layout.tsx`). Add pages under `apps/web/src/pages` and register routes in `App.tsx`.
- Components sometimes use conditional class composition and `NavLink` active callbacks (see `Navbar.tsx` for example).
- Types: code is TypeScript-first, but there are a few `.jsx` files (e.g. `TourForm.jsx`) — be conservative when converting to TS; update `tsconfig` if you add many `.jsx` files.
- ESLint config exists (`eslint.config.js`) — follow it when adding TypeScript/React code.

## Testing & CI
- No tests or CI workflows exist in the repo at time of writing. Do not add large infra (CI, coverage) without asking maintainers.

## Things an agent should NOT assume
- There is no automatic proxy from Vite to the backend; prefer absolute URLs for local API calls or add a Vite proxy explicitly and document it.
- Some files (comments and text) use Norwegian — prefer neutral English for new code/comments unless instructed otherwise.

## Quick developer tasks (how to add common features)
- Add API endpoint:
  1. Create `apps/api/src/routes/<thing>Routes.ts` exporting a Router.
  2. Register it in `apps/api/src/index.ts` as `app.use('/api/<thing>', router)`.
  3. Add types and tests (if requested) and update README.

- Add a new page/route in frontend:
  1. Create `apps/web/src/pages/NewPage.tsx`.
  2. Add `<Route path="/new" element={<NewPage />} />` inside `<Route element={<Layout/>}>` in `App.tsx`.

## Notes for maintainers / when to ask humans
- If you plan to change workspace tooling (pnpm, yarn, swap TS versions) or add CI tests, ask maintainers first.
- Ask about language preference for user-facing strings (Norwegian vs English).

---
If anything above is unclear or you want me to expand examples (e.g., scaffolding a `/api/tours` endpoint + frontend integration), tell me which area to flesh out and I'll update this file. ✅