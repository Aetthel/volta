# Implementation Tasks: Granular RBAC & Role Permission Security

## 1. Frontend Route & Navigation RBAC Enforcement
- [x] 1.1 Update `frontend/proxy.js` to exclude `/ajustes` from `empleadoRoutes`.
- [x] 1.2 Update `frontend/components/Sidebar.tsx` to conditionally render `/ajustes` link only for `JEFE` or `ADMIN`.

## 2. Backend Middleware & Endpoint Protection
- [x] 2.1 Add `requireRole` middleware in `backend/src/middleware/authMiddleware.js`.
- [x] 2.2 Enforce `requireRole(["ADMIN", "JEFE"])` on `backend/src/routes/whatsapp.js`, `business.js` (PUT/DELETE), `services.js` (POST/PUT/DELETE), and `users.js`.
- [x] 2.3 Add unit tests verifying 403 Forbidden responses when `EMPLEADO` invokes restricted endpoints.
