## Why

To resolve critical security vulnerabilities, stability risks, and performance bottlenecks identified in Volta's codebase. These include a login rate-limiting bypass, a Puppeteer event listener memory leak, a sequential cron job blocking issue, and an in-memory client table scanning bottleneck.

## What Changes

- **Authentication Rate Limiter Security Fix**: Ensure the NextAuth Credentials login rate limiter correctly tracks failed login attempts, handling redirection and JSON error responses without resetting the limit.
- **WhatsApp Memory Leak Fix**: Reimplement `waitForReady` in `whatsappService.js` to cleanly remove all temporary event listeners once resolved or rejected.
- **Sentinel Robustness and Scaling**: Update `botService.js` to skip disconnected WhatsApp sessions immediately, avoiding a 45-second blocking timeout per appointment.
- **Client Lookup Database Optimization**: Replace the in-memory client scanning logic in `appointmentsService.js` with database-level queries using phone number and name.
- **Frontend JWT Verification Alignment**: Align the frontend JWT parsing with the backend's byte-length check to avoid throwing internal uncaught exceptions.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `web-authentication`: Hardens the login rate limiting verification.
- `whatsapp-integration`: Implements robust session state checking and prevents memory leaks/blocking issues.
- `multitenant-core`: Optimizes database query load for client registration checks.

## Impact

- **Frontend Auth Router**: `frontend/app/api/auth/[...nextauth]/route.js`
- **WhatsApp Integration Service**: `backend/src/services/whatsappService.js`
- **Sentinel Daemon Service**: `backend/src/services/botService.js`
- **Appointments Service**: `backend/src/services/appointmentsService.js`
- **Frontend Crypto Helper**: `frontend/lib/crypto.ts`
