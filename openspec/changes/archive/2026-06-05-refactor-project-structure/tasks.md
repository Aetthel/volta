## 1. Setup Monorepo Workspace

- [x] 1.1 Update root `package.json` to define NPM workspaces (`"workspaces": ["frontend", "backend"]`).
- [x] 1.2 Move root configurations (`.gitignore`, `.env.example`, `docker-compose.yml`) into a clean state for the monorepo root.

## 2. Initialize Backend Workspace

- [x] 2.1 Create `/backend` directory and initialize its `package.json`.
- [x] 2.2 Move `prisma/` folder and `src/` (bot logic, db.js) into `/backend`.
- [x] 2.3 Move `scripts/` (e.g., `seed.js`) into `/backend`.
- [x] 2.4 Add `whatsapp-web.js`, `@prisma/client`, and other backend-specific dependencies to `/backend/package.json`.

## 3. Initialize Frontend Workspace

- [x] 3.1 Create `/frontend` directory and initialize its `package.json`.
- [x] 3.2 Move Next.js application files (`app/`, `components/`, `lib/`, `public/`) into `/frontend`.
- [x] 3.3 Move UI configuration files (`tailwind.config.mjs`, `postcss.config.mjs`, `components.json`, `next.config.mjs`) into `/frontend`.
- [x] 3.4 Add Next.js, React, Tailwind, and shadcn dependencies to `/frontend/package.json`.

## 4. Re-link Dependencies and Imports

- [x] 4.1 Update `frontend` to consume the Prisma client from `backend` (e.g., configuring Next.js to trace the backend Prisma client or exporting it from backend).
- [x] 4.2 Fix any broken absolute imports (e.g., `@/components`) in `frontend` due to the move.
- [x] 4.3 Fix path references in backend bot files (e.g., `.wwebjs_auth` cache locations).

## 5. Update Scripts and Docker Configuration

- [x] 5.1 Add unified npm scripts in the root `package.json` to run `frontend` and `backend` simultaneously.
- [x] 5.2 Update `docker-compose.yml` to support the new structure (e.g., adjusting volume mounts and build contexts).
- [x] 5.3 Verify the complete application starts up successfully with the new structure.
