## 1. Backend Security Validation Middleware

- [x] 1.1 Add database status and trial expiration check in `backend/src/middleware/auth.js`
- [x] 1.2 Return standardized 403 response `{ error: "Prueba finalizada", code: "TRIAL_EXPIRED", redirect: "/" }` on expired trial/revoked account
- [x] 1.3 Create dedicated endpoint `/api/backend/auth/check-permissions` to return real-time account authorization status

## 2. Frontend Global Interceptor & Real-Time Security Guard

- [x] 2.1 Implement global API fetch response interceptor to handle `TRIAL_EXPIRED` and `PERMISSIONS_REVOKED` response codes
- [x] 2.2 Create `frontend/components/SecurityGuard.tsx` component with 30s background timer and tab visibility change listener
- [x] 2.3 Include `<SecurityGuard />` inside `frontend/components/Providers.tsx` for global protection across all dashboard pages
- [x] 2.4 Verify automatic redirection to landing page (`/`) on trial expiration and revoked permissions

## 3. Verification & Testing

- [x] 3.1 Run TypeScript type check and unit test suite to verify 100% clean build
- [x] 3.2 Test real-time expulsion on expired trial and revoked role scenarios
