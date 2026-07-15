## Why

The database startup currently generates static mock development users and businesses which clutter the database. Now that we have a dynamic "Create Demo" button, these hardcoded mock accounts are no longer needed. Additionally, a bug in the NextAuth middleware role resolution intercepts the automatic redirection to `/inicio` for demo users, immediately redirecting them back to `/login`.

## What Changes

- Remove hardcoded development mock seeding (users, business, appointments, and clients) from the database bootstrap/initialization logic on backend start.
- Fix role resolution in the NextAuth middleware (`proxy.js`) to allow demo users (and regular users) to access protected routes after successful login without being redirected to `/login`.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `production-safe-seeding`: Clean up development mock seeding on database startup.
- `web-authentication`: Correct role validation in the NextAuth middleware to prevent redirect loops.

## Impact

- `backend/src/config/dbInit.js`: Remove mock database records insertion on startup.
- `frontend/proxy.js`: Update role detection logic to retrieve the role from the top-level token object if not found in the user sub-object.
