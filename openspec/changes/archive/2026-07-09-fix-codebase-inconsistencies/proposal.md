## Why

Several inconsistencies and security gaps have been identified across the Volta codebase:

1. Backend route handlers for appointments, services, and WhatsApp do not enforce tenant isolation locally, relying solely on the frontend proxy, which exposes endpoints if accessed directly.
2. The frontend calendar view has a month naming bug that displays "Diciembre" or "undefined" for months in the second half of the year.
3. The frontend lacks role-based UI route protection for administrative routes (`/admin` and `/sedes`), causing unauthorized users to see broken skeletons instead of an access denied page.
4. The WhatsApp bot is inconsistent in initializing and waiting for client readiness, leading to failed message sends for welcome messages and daily sentinel notifications.
5. Inaccurate comments exist regarding the database not storing service details.

## What Changes

- **Strict Tenant Isolation**: Implement explicit `req.user.businessId` checks in the backend controllers for `appointments` (GET, POST), `services` (GET, POST, PUT, DELETE), and `whatsapp` (all endpoints) to guarantee that non-admin users can only access their own salon data.
- **Calendar Months Fix**: Correct the `monthNames` array in the calendar page to include all 12 months.
- **UI Route Protection**: Implement middleware checks or parent layout-level checks in Next.js to restrict `/admin` and `/sedes` routes to the `ADMIN` role, redirecting or showing a proper Access Denied message to other users.
- **Robust WhatsApp Client Send**: Update the bot welcome and sentinel routines to always execute `waitForReady()` before attempting message delivery.
- **Comment Cleanup**: Correct misleading comments regarding the database schema.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `multitenant-core`: Enforce strict server-side tenant checks in all core backend endpoints.
- `web-authentication`: Add role-based UI route protection for `/admin` and `/sedes` on the client side.
- `whatsapp-integration`: Ensure Puppeteer readiness checks are consistently called before sending notifications.

## Impact

- `backend/src/routes/appointments.js`: Add tenant validation to GET and POST endpoint handlers.
- `backend/src/routes/services.js`: Add tenant validation to GET, POST, PUT, and DELETE endpoint handlers.
- `backend/src/routes/whatsapp.js`: Add tenant validation to all template, status, initialization, and disconnection handlers.
- `backend/src/bot.js`: Integrate `waitForReady` before sending welcome and sentinel messages.
- `frontend/app/agenda/page.tsx`: Fix the `monthNames` array declaration.
- `frontend/app/admin/page.tsx`: Add check to redirect or render access-denied UI if user role is not `ADMIN`.
- `frontend/app/sedes/page.tsx`: Add check to redirect or render access-denied UI if user role is not `ADMIN`.
- `frontend/components/NewAppointmentModal.tsx`: Correct the outdated DB-storage comment.
