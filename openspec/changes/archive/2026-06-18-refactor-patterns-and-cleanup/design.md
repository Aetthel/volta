## Context

The backend entry point (`backend/src/index.js`) currently performs several distinct tasks that violate the Single Responsibility Principle:
1. Validating and loading environment variables (coupled directly at the top of the file).
2. Seeding mock businesses, admin/jefe/empleado users, and example clients/appointments (`ensureMockBusinessesExist`).
3. Configuring Express middleware, CORS, rate limits, and modular routers.
4. Running background cron schedules.
5. Auto-initializing active WhatsApp clients.

This coupling makes the codebase harder to maintain, test, and adapt.

## Goals / Non-Goals

**Goals:**
- **Decouple Configuration**: Centralize environment variable validation, defaults, and exporting into `backend/src/config.js`.
- **Decouple Database Seeding/Initialization**: Move `ensureMockBusinessesExist` into `backend/src/dbInit.js` so database initialization logic is isolated from API route routing/server configuration.
- **Simplify index.js**: Keep the entry point focused on bootstrapping the Express application, registering routes, and starting the listener.

**Non-Goals:**
- Rewriting core whatsapp-web.js operations or business logic in `whatsapp.js` and `bot.js`.
- Modifying Prisma database schemas or database fields.
- Modifying frontend application behavior or component structure.

## Decisions

### 1. Introduce `backend/src/config.js`
All configurations and environment variables will be centralized in this module. It handles:
- Dynamic dotenv parsing based on Docker execution environment.
- Required environment variable checks (`DATABASE_URL`, `API_KEY`).
- Standardized config exports (ports, frontend URL, database configurations, Puppeteer settings).

**Alternatives considered:**
- Keeping env validation inline in `index.js`. Rejected because it duplicates logic if configuration is imported by other standalone scripts (e.g. seeds, testing tools).

### 2. Move database seeding to `backend/src/dbInit.js`
The database seeding function `ensureMockBusinessesExist` is moved to a separate file that exports a clean startup db validation.
- The `index.js` startup wrapper calls `dbInit.ensureMockBusinessesExist()` before mounting the port listner.

**Alternatives considered:**
- Forcing manual npm run seed. Rejected because automatic database bootstrap on container/local start is preferred to keep the development setup seamless for developers.

### 3. Modular route mounting and Express initialization
`index.js` will use the config module instead of referencing `process.env` directly. This makes it easier to mock configuration during integration tests.

## Risks / Trade-offs

- **[Risk]**: Environmental validation crashing standalone scripts that do not require all variables.
  - *Mitigation*: Ensure `config.js` only checks for absolutely critical variables needed for the general app context, and keep standard defaults (like ports and frontend urls).
- **[Risk]**: Circular dependency between db connector and configuration.
  - *Mitigation*: Establish a clear strict flow of dependencies: `config.js` -> `db.js` -> `dbInit.js` -> `index.js`.
