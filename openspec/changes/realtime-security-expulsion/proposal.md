## Why

When a user's subscription or trial expires, or when their account permissions are revoked by an administrator, they must be immediately and securely expelled from any active session in real-time, revoking access and redirecting them to the public landing page (`/`). Currently, session checks are static or passive, allowing unauthorized users to remain inside dashboard pages until a manually triggered action occurs.

## What Changes

- **Backend Security Check**: Update `authenticate` middleware in `backend/src/middleware/auth.js` to perform database verification of account status (`ACTIVE`, `TRIALING`, `EXPIRED`) and trial expiration timestamp (`trialExpiresAt`).
- **HTTP 403 Security Response**: Standardize forbidden error responses from backend API endpoints with specific code payload `{ error: "Prueba o suscripción finalizada", code: "TRIAL_EXPIRED", redirect: "/" }`.
- **Global Client Interceptor**: Implement a global response interceptor for fetch calls that catches `TRIAL_EXPIRED` or `PERMISSIONS_REVOKED` error codes and automatically triggers `signOut({ callbackUrl: "/" })`.
- **Real-Time Security Guard (`<SecurityGuard />`)**: Add a client-side background heartbeat component inside `Providers.tsx` that periodically validates active session status (every 30s and on tab focus/visibility change), instantly expelling expired users without waiting for a manual click.

## Capabilities

### New Capabilities
- `security-expulsion`: Real-time session validation and automatic expulsion system for trial expiration and permission revocation.

### Modified Capabilities
- None.

## Impact

- **Backend**: `backend/src/middleware/auth.js`, `backend/src/controllers/`
- **Frontend**: `frontend/lib/alerts.tsx`, `frontend/components/Providers.tsx`, `frontend/components/SecurityGuard.tsx`, `frontend/middleware.ts`
- **Dependencies**: NextAuth (`signOut`), Prisma ORM
