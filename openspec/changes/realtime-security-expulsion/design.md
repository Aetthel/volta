## Context

Currently, Volta handles user sessions via NextAuth JWT tokens and protects dashboard routes in Next.js middleware based on static role checks (`ADMIN`, `JEFE`, `EMPLEADO`). However, if a user's 10-day trial expires while they are logged in, or if their account status is changed in the database, the user remains inside protected dashboard pages until they attempt a privileged operation or refresh the page.

We need a real-time expulsion security layer that terminates the session and redirects the user to the public landing page (`/`) as soon as invalid permissions or expired trial status are detected.

## Goals / Non-Goals

**Goals:**
- **Instant Response on API Access**: Expel the user immediately if any backend API call returns a `403` with code `TRIAL_EXPIRED` or `PERMISSIONS_REVOKED`.
- **Active Background Heartbeat**: Periodically check permission and trial status every 30 seconds and on browser tab visibility change via `<SecurityGuard />`.
- **Clean Session Termination**: Invoke NextAuth `signOut({ callbackUrl: "/" })` to invalidate client cookies and redirect cleanly to landing page `/`.

**Non-Goals:**
- Stateful WebSocket server infrastructure (HTTP polling and API interceptors provide reliable real-time response with zero server overhead).

## Decisions

### Decision 1: Hybrid Security Architecture (Backend Auth Middleware + Client Interceptor + Heartbeat Guard)
- **Backend Middleware**: Update `backend/src/middleware/auth.js` to inspect `business.subscriptionStatus` and `business.trialExpiresAt` on every authenticated request.
- **Client Interceptor**: Intercept API fetch calls to catch `403` response codes containing `TRIAL_EXPIRED` or `PERMISSIONS_REVOKED`.
- **Client Heartbeat Component**: Add `<SecurityGuard />` inside `Providers.tsx` to execute a lightweight `/api/backend/auth/check-permissions` endpoint check in the background.

### Alternatives Considered
- *WebSockets / Server-Sent Events*: Adds complex connection lifecycle management for simple trial/permission checking.
- *Middleware-only check*: Only triggers on page navigation, leaving idle open tabs vulnerable.

## Risks / Trade-offs

- **[Risk] High API load from polling** → **Mitigation**: Heartbeat interval set to 30s + visibility change, checking lightweight in-memory/cached query.
- **[Risk] False positive logout during temporary network hiccup** → **Mitigation**: Only expel on explicit `401`/`403` JSON responses with specific error code payload, never on network error `500` or offline status.
