## Why

The backend codebase contains critical security gaps in tenant isolation (allowing cross-business read actions on clients and listing all global users), business metrics discrepancies (using hardcoded static maps and client preference defaults instead of real dynamic database prices), and database churn in operating hours configuration (causing unstable UUID primary keys due to delete-and-recreate operations).

## What Changes

- **BREAKING**: Implement strict session validation in Next.js backend API proxy to ensure any query or body `businessId` parameter matches the user's authenticated `session.user.businessId` (preventing unauthorized cross-tenant data requests).
- Enforce strict `businessId` filtering on user lists in the backend routes so non-admin users can only view workers belonging to their specific business.
- Refactor dashboard stats calculation logic to query dynamic database `Service` prices and actual appointment service properties instead of a static in-memory mapping and `frequentService` client defaults.
- Refactor the operating hours update transaction in the backend to perform sequential upserts (matching `dayOfWeek`) on `BusinessHours` instead of deleting and re-creating the entire schedule.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `multitenant-core`: Enforce strict tenant validation checks at the Next.js API proxy level and backend user list filters.
- `admin-business-control`: Transition backend dashboard metrics from static hardcoded calculations to real dynamic database values.
- `business-settings`: Optimize operating hours update operations to use database upserts, securing UUID identity persistence.

## Impact

- `frontend/app/api/backend/[...path]/route.ts`: Validate user sessions against path, query, and body `businessId` parameters.
- `backend/src/routes/users.js`: Restrict `GET /api/backend/users` to return only users of the same `businessId` if the requester is not a global ADMIN.
- `backend/src/routes/admin.js`: Modify stat aggregation queries to fetch actual services and prices from DB.
- `backend/src/routes/business.js`: Refactor update business hours transaction.
