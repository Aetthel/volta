## Context

Several codebase inconsistencies have been identified:

- **Backend security gaps**: Lack of backend verification of `businessId` on appointments, services, and WhatsApp endpoints, leaving database endpoints vulnerable if the Next.js API proxy is bypassed.
- **Visual Bugs**: The frontend calendar has an incomplete `monthNames` array, failing to properly render months in the second half of the year.
- **Client Route Protections**: Next.js route protection in `auth.config.js` only checks login status, allowing non-admin users to navigate to `/admin` and `/sedes` layouts where fetch requests fail and load indefinitely.
- **WhatsApp Client Race Conditions**: The bot code initializes the WhatsApp client but sends messages immediately without waiting for Puppeteer to become ready.

## Goals / Non-Goals

**Goals:**

- Implement robust tenant isolation checks at the Express route level in the backend.
- Fix the calendar UI display of month names in Spanish.
- Restrict client-side navigation to `/admin` and `/sedes` to users with the `ADMIN` role.
- Guarantee that the WhatsApp client is ready before welcome and sentinel notifications are sent.
- Fix obsolete comment headers.

**Non-Goals:**

- Changing database schema models.
- Refactoring the entire routing system of Express or Next.js.
- Changing authentication providers.

## Decisions

### 1. Direct Tenant Isolation Checks in Backend Route Handlers

- **Context**: In `appointments.js` and `services.js`, we need to check if the query or body `businessId` matches the logged-in user's `businessId`.
- **Decision**: Update GET/POST handlers to check `req.user.role !== 'ADMIN' && businessId !== req.user.businessId` and return `403 Forbidden` if they mismatch. Similarly, for `whatsapp.js` endpoints, validate the incoming `businessId`.
- **Alternative considered**: Implementing this as a reusable Express middleware. However, since `businessId` is sometimes in `req.query` (for GET) and sometimes in `req.body` (for POST), doing inline checks in the route handlers matches the pattern already used in `clients.js` and keeps the codebase simple and clean.

### 2. Client-side Page Checks for Admin Views

- **Context**: Next.js uses App Router. We need to prevent non-admins from loading `/admin` and `/sedes`.
- **Decision**: In `frontend/app/admin/page.tsx` and `frontend/app/sedes/page.tsx`, check if `session?.user?.role !== 'ADMIN'`. If so, render a clean Access Denied page utilizing the `<Alert variant="error">` component inside the standard dashboard layout shell. This maintains a clean and consistent navigation interface.
- **Alternative considered**: Checking roles inside `auth.config.js`'s `authorized` callback. However, the `authorized` callback in NextAuth v5 middleware is run before JWT/session callbacks resolve user properties completely in some middleware execution contexts. Performing a check inside the page components offers a smoother UX without redirecting users to the login screen.

### 3. Puppeteer Readiness Hook for Bot Operations

- **Context**: `bot.js` calls `whatsappManager.initClient()` and then immediately sends.
- **Decision**: Await `whatsappManager.waitForReady(businessId, 45000)` right after `initClient()` in `sendWelcomeMessage` and `runSentinel`.
- **Alternative considered**: None; this standardizes the behavior with `sendConsentMessage`.

## Risks / Trade-offs

- **[Risk]**: Checking roles inside React page components still mounts the layout.
  - _Mitigation_: The component will render a blank skeleton or standard UI structure, but the actual dashboard data will show an access denied message and backend requests will be blocked.
- **[Risk]**: Awaiting `waitForReady` in `runSentinel` daily loop might introduce delays.
  - _Mitigation_: The sentinel loops sequentially. Since it is a background cron running daily, sequential waiting is acceptable.
