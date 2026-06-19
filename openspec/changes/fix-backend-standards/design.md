## Context

The Volta backend contains security gaps in tenant isolation (allowing cross-business read actions on clients and listing all global users), business metrics discrepancies (using hardcoded static maps and client preference defaults instead of real dynamic database prices), and database churn in operating hours configuration (causing unstable UUID primary keys due to delete-and-recreate operations).

## Goals / Non-Goals

**Goals:**
- Implement strict session validation in the frontend Next.js proxy to secure cross-tenant query and body parameter access.
- Propagate user authentication context (`x-user-role` and `x-user-business-id`) as headers to the backend to enable context-aware endpoint filtering.
- Modify `GET /api/backend/users` endpoint in `routes/users.js` to restrict non-admin users to their own business's employees.
- Recalculate dashboard statistics dynamically in `routes/admin.js` using database `Service` prices and actual appointment service details.
- Refactor weekly operating hours updates in `routes/business.js` to perform upserts by `dayOfWeek` to maintain stable primary key UUIDs.

**Non-Goals:**
- Frontend styling or component alterations (already resolved in `unify-frontend-standards`).
- Modifying authentication schemas, tables, or database structure.

## Decisions

### 1. Authenticated Headers in Next.js API Proxy
The Next.js backend proxy (`frontend/app/api/backend/[...path]/route.ts`) SHALL append `x-user-role` and `x-user-business-id` to the headers of all downstream requests to the backend server.
The backend authentication middleware (`backend/src/middleware.js`) SHALL read these headers and attach them as `req.user` so they can be consumed by routes.

### 2. Validate Explicit businessId Parameters in Proxy
In the Next.js backend proxy, if the request is not public and the logged-in user is not an `ADMIN`, the proxy SHALL check the URL query parameters and JSON request body for any `businessId` parameters. If a parameter is found and does not match the authenticated user's `session.user.businessId`, the proxy SHALL return a `403 Forbidden` response.

### 3. Retrieve Actual Database Service Prices for Metrics
In `backend/src/routes/admin.js`, dashboard metrics calculation will query appointments with their associated `service` relations and the list of services for each business. We will resolve the price of each appointment using the following order of precedence:
1. `app.service.price` (direct link relation).
2. Look up the custom service in the business's database services where `s.name === app.serviceName`.
3. Look up the custom service in the business's database services where `s.name === app.client.frequentService`.
4. Fallback to `servicePrices[serviceName]` or `35`.

### 4. Database Upserts for Business Hours
In `backend/src/routes/business.js`, the PUT handler for weekly operating hours will run a database transaction performing sequential `upsert` operations on `BusinessHours` records matching `businessId` and `dayOfWeek`. This prevents the deletion and recreation of records and preserves UUID stability.

## Risks / Trade-offs

- **[Risk]**: Client applications or direct scripts could attempt to forge downstream header authentication variables.
  - *Mitigation*: The backend requires the shared static secret `API_KEY` via `x-api-key` header (enforced by the `authenticate` middleware). The backend MUST NOT accept public requests that do not pass key validation.
- **[Risk]**: Querying related services and clients for all appointments in dashboard stats could reduce performance for large datasets.
  - *Mitigation*: Query optimizations are applied by using Prisma's `include` filters to resolve relations in a single database round-trip.
