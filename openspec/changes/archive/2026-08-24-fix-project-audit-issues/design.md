## Context

During a thorough project audit, several bugs and non-conforming configurations were identified across the Volta repository:
1. `lastVisit` field assigned `"Hoy"` (string) in `appointmentsService.js` causing a Prisma Client validation error because `schema.prisma` specifies `DateTime?`.
2. `EventManager.tsx` triggers an ESLint error (`react-hooks/set-state-in-render`) due to `setEvents` being called inside `useMemo`.
3. `package.json` in `frontend` specifies `"build": "next build --debug-prerender"`, which forces development prerendering during production builds and breaks TypeScript type checking.
4. Leftover empty directories from OS file sync (`backend 2/`, `frontend 2/`, etc.) exist in the root folder.
5. JavaScript files (`route.js` for NextAuth and `rateLimit.js`) exist inside a TypeScript frontend project.
6. Hardcoded production credentials in `.env.prod`.

## Goals / Non-Goals

**Goals:**
- Fix the `lastVisit` field in `appointmentsService.js` to ensure runtime safety with Prisma.
- Resolve all ESLint and TypeScript build failures so `pnpm lint` and `pnpm build` pass cleanly.
- Clean up workspace residue directories.
- Migrate legacy `.js` files in `frontend` to TypeScript (`.ts`).
- Sanitize `.env.prod` secrets and clarify `.env.example`.

**Non-Goals:**
- Refactoring business logic or changing API contracts.
- Modifying database schemas or running new Prisma migrations.

## Decisions

- **Decision 1: Use `new Date()` for client `lastVisit`**:
  - *Rationale*: Prisma expects a JavaScript `Date` object or ISO string that can map to PostgreSQL `TIMESTAMP`. Using `new Date()` correctly sets the timestamp when an appointment automatically registers a new client.
- **Decision 2: Replace `useMemo` with `useEffect` in `EventManager.tsx`**:
  - *Rationale*: State synchronization from props should occur inside `useEffect` or be derived during render, avoiding state mutation inside `useMemo`.
- **Decision 3: Standardize `"build": "next build"`**:
  - *Rationale*: `--debug-prerender` is a debug flag for Next.js 16 development. Production builds must use `next build`.
- **Decision 4: Convert `route.js` and `rateLimit.js` to `.ts`**:
  - *Rationale*: Maintains strict 100% TypeScript coverage across the Next.js frontend application.

## Risks / Trade-offs

- [Risk] TypeScript migration of `route.js` might miss NextAuth / rate-limiting type annotations.
  → *Mitigation*: Import official types from `next/server` and `next-auth`.
