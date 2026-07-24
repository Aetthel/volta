## Context

1. The database initialization startup scripts currently populate a hardcoded test business and mock user credentials when running in development mode.
2. The dynamic "Create Demo" feature creates temporary users and businesses, rendering the hardcoded startup mock credentials obsolete and creating database clutter.
3. In `frontend/proxy.js`, NextAuth v5 role resolution was incorrectly reading `req.auth?.user?.role` instead of checking the root token property `req.auth?.role`, which is where custom properties from the JWT token are located in the middleware since the `session` callback does not execute in the middleware.

## Goals / Non-Goals

**Goals:**

- Eliminate hardcoded startup mock user and business seeding in the backend.
- Resolve the NextAuth middleware role parsing mismatch to prevent redirect loops for demo and regular users.

**Non-Goals:**

- Removing the `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` auto-creation in production (this should remain intact).
- Modifying the schema definition or database models.

## Decisions

### 1. Simplify `dbInit.js`

- **Choice**: Remove all mock user seeding, mock business creation, and demo clients/appointments mock seeding from `backend/src/config/dbInit.js`.
- **Rationale**: Keeps the local development database completely clean. The dynamic demo creation system is now the sole source of mock data generation for demonstration.

### 2. Read Role from Token Root in Middleware

- **Choice**: Retrieve the user's role in the NextAuth middleware from `req.auth?.role || req.auth?.user?.role`.
- **Rationale**: Since the `session` callback is bypassed during NextAuth middleware parsing, the custom properties inside the JWT token reside at the root of the session/token wrapper instead of the user sub-object. Checking both properties ensures compatibility in all next-auth execution phases.

## Risks / Trade-offs

- [Risk] → If a developer opens the frontend page without being logged in, they will be redirected to `/login` instead of viewing a fallback business dashboard under `mock-business-id`.
- [Mitigation] → This is the correct, secure behavior for a multi-tenant SaaS application. Developers must sign in or click "Crear Demo" to access the dashboard.
