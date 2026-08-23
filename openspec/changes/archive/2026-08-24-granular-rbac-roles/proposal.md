# Proposal: Granular RBAC & Role Permission Security

## Why

Currently in Volta, users with role `EMPLEADO` have access to the exact same frontend routes as `JEFE` (including `/ajustes`), allowing employees to modify sensitive business settings, pair/unpair WhatsApp QR instances, or view subscription details. Furthermore, backend API endpoints for business settings and WhatsApp management lack explicit role authorization checks.

## What Changes

- Restrict frontend route `/ajustes` to `JEFE` and `ADMIN` roles in `frontend/proxy.js`.
- Add a role authorization middleware `requireRole(["ADMIN", "JEFE"])` in `backend/src/middleware/index.js`.
- Protect sensitive backend endpoints (`/api/whatsapp`, `/api/business`, `/api/users`) to enforce required roles.
- Update frontend Navigation (`Sidebar.tsx`) to hide `/ajustes` link when the logged-in user is an `EMPLEADO`.

## Capabilities

### Modified Capabilities

- `web-authentication`: Enforce role-based access control (RBAC) across frontend routes and backend REST endpoints for `ADMIN`, `JEFE`, and `EMPLEADO`.

## Impact

- `frontend/proxy.js`: Update `empleadoRoutes` to `["/inicio", "/clientes", "/agenda"]`.
- `frontend/components/Sidebar.tsx`: Filter navigation links based on user role.
- `backend/src/middleware/authMiddleware.js`: Add `requireRole` middleware.
- `backend/src/routes/whatsapp.js`, `business.js`, `users.js`: Apply `requireRole` checks.
