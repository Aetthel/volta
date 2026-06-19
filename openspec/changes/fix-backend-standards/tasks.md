## 1. Proxy Security & Downstream Context

- [x] 1.1 Append `x-user-role` and `x-user-business-id` headers in Next.js backend proxy (`frontend/app/api/backend/[...path]/route.ts`)
- [x] 1.2 Implement session `businessId` checks in Next.js API proxy to block unauthorized query or body cross-tenant data requests
- [x] 1.3 Update backend `authenticate` middleware (`backend/src/middleware.js`) to parse custom user headers and assign them to `req.user`

## 2. Enforce Tenant Isolation in Backend routes

- [x] 2.1 Refactor user listing route (`backend/src/routes/users.js`) to filter workers by `req.user.businessId` if the requester is not a global ADMIN
- [x] 2.2 Re-verify that the client list route (`backend/src/routes/clients.js`) enforces proper business filtering and has no bypass options

## 3. Dynamic Metrics Calculations

- [x] 3.1 Refactor admin dashboard route (`backend/src/routes/admin.js`) to fetch appointments with their related services and clients, as well as the list of custom services
- [x] 3.2 Implement the multi-tier price resolution logic in `admin.js` to compute revenue and average ticket sizes dynamically

## 4. Operating Hours Stability

- [x] 4.1 Update operating hours PUT route (`backend/src/routes/business.js`) to perform database transaction upserts on `BusinessHours` by `dayOfWeek` instead of deleting and recreating them

## 5. Verification

- [x] 5.1 Run development build (`npm run build` or `npm run dev`) and test API endpoints to ensure no security, compilation, or logical regressions are introduced
