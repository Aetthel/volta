## Why

A comprehensive codebase audit revealed critical runtime bugs, linting failures, broken build scripts, security risks (exposed production secrets in version control), leftover duplicate directories from OS sync, and non-conforming JavaScript files in a TypeScript codebase. Fixing these issues ensures production build reliability, system stability, type safety, and clean CI/CD execution.

## What Changes

- **Fix Prisma DateTime Type Bug**: Update `createAppointment` in `backend/src/services/appointmentsService.js` to set `lastVisit` to `new Date()` instead of the invalid literal string `"Hoy"`.
- **Fix ESLint & React Hook Anti-Pattern**: Replace `useMemo` side-effect with `useEffect` (or pure state derivation) in `frontend/components/EventManager.tsx`.
- **Fix Production Build Script**: Update `"build"` in `frontend/package.json` from `"next build --debug-prerender"` to `"next build"`.
- **Clean Up Duplicate Residue Directories**: Delete empty leftover directories `backend 2/`, `frontend 2/`, `openspec 2/`, `node_modules 2/`, and `.git 2/`.
- **Migrate Frontend JavaScript Files to TypeScript**: Convert `frontend/app/api/auth/[...nextauth]/route.js` and `frontend/lib/rateLimit.js` to TypeScript (`.ts`).
- **Sanitize Secrets**: Sanitize hardcoded secrets in `.env.prod` to placeholder values and document `REDIS_URL` in `.env.example`.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `appointment-management`: Ensure client creation within appointment workflow assigns valid DateTime objects to `lastVisit`.
- `reusable-ui-components`: Enforce clean React state management rules in `EventManager.tsx`.
- `deployment-automation`: Ensure production build scripts and CI/CD pipelines run without errors.
- `project-modular-structure`: Maintain clean workspace file structure and 100% TypeScript coverage in frontend.

## Impact

- **Backend**: Improved stability when creating appointments for new clients.
- **Frontend**: Fixed build (`pnpm build`) and lint (`pnpm lint`) processes; complete TypeScript coverage for NextAuth and rate limiter.
- **CI/CD**: GitHub Actions workflow (`deploy.yml`) will complete successfully.
- **Security**: Confidential production secrets removed from git history tracking in `.env.prod`.
