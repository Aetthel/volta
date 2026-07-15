## Why

The Volta platform needs a unified mechanism to notify users of critical business warnings (e.g., subscription failures, disconnected WhatsApp bot) and general notifications, as well as popup notices for new feature onboarding. Currently, the system lacks any alerts, forcing developers to implement ad-hoc banners. A dedicated, structured alerts system resolves this.

## What Changes

We are introducing a three-tiered Alerts & Notifications system:
1. **Emergentes (Popups):** Global onboarding or critical modal popups that show up upon dashboard load, presented in a clean pagination carousel card. They are also pinned to the top of the notification dropdown.
2. **Avisos (Warnings):** Critical operational warnings (like WhatsApp link failures) styled with warning colors and icons in the dropdown.
3. **Notificaciones (Notifications):** Informative messages (like booking receipts) styled with default colors.
We will add database persistence using Prisma to track read/unread states per user, an API routing system on the backend, and interactive dropdown and modal components on the frontend.

## Capabilities

### New Capabilities
- `alerts-system`: Introduce the Alert data model, backend API routes for managing alerts, the frontend bell notification popover, and the dashboard welcome modal carousel.

### Modified Capabilities
<!-- None -->

## Impact

- **Database:** A new `Alert` model in `schema.prisma` mapping to a PostgreSQL table.
- **Backend API:** New express routes under `/api/alerts` to list, create, and mark alerts as read.
- **Frontend Header:** A new popover dropdown inside `frontend/components/Header.tsx` that replicates the floating style of `NewAppointmentModal` and displays notifications.
- **Frontend Dashboard:** A dashboard popover overlay at `/inicio` showing unread `EMERGENTE` alerts in a carousel.
- **Demo / Seeding:** Updates to automatic demo creation to seed sample alerts for realistic UI evaluation.
