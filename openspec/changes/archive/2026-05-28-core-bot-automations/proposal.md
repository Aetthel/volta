## Why

Volta aims to be an invisible notification engine that automates appointment reminders for businesses. This change implements the core bot and automation logic (Phase 1) to reduce missed appointments and manual labor without requiring a complex web interface initially.

## What Changes

- **Multi-tenant WhatsApp Engine**: Implementation of `whatsapp-web.js` with multi-instance support and persistent local authentication.
- **Data Persistence**: Setup of PostgreSQL with Prisma ORM to manage businesses and appointments.
- **Automation Scheduler (The Sentinel)**: A `node-cron` process that scans for pending appointments for the following day at 20:00h.
- **Appointment API**: A protected REST endpoint (`POST /api/appointments`) to insert appointment data from external sources.
- **Anti-Ban Policy**: Implementation of random delays (30-60s) between messages to emulate human behavior.
- **Local Deployment**: Docker Compose configuration for local server deployment (Proxmox/lxc-prod).

## Capabilities

### New Capabilities
- `multitenant-core`: Generic data structure to handle multiple businesses independently.
- `whatsapp-integration`: Multi-instance management, session persistence, and QR code handling for business WhatsApp accounts.
- `appointment-management`: CRUD logic and status tracking (PENDING, SENT, ERROR) for client appointments.
- `notification-automation`: Cron job logic to filter, queue, and dispatch personalized WhatsApp reminders.

### Modified Capabilities
- (None - Initial Phase 1 Implementation)

## Impact

- **Backend**: New Node.js/Express service.
- **Database**: New PostgreSQL instance managed via Prisma.
- **Infrastructure**: New Docker Compose setup and `wwebjs-auth` volume for session storage.
- **External Dependencies**: `whatsapp-web.js`, `prisma`, `node-cron`, `express`.
