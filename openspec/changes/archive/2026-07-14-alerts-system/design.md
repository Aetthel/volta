## Context

The Volta application has a Next.js frontend with NextAuth v5 session cookies and an Express backend connecting to PostgreSQL via Prisma ORM. Currently, there is no centralized database representation of alerts or notifications, nor is there a UI menu for the header notification bell or dashboard popups.

## Goals / Non-Goals

**Goals:**

- Add database support for categorized user alerts (Popups, Warnings, Notifications).
- Build a unified backend controller and API endpoints for managing alerts.
- Implement a floating popover dropdown aligned with the header bell icon, matching the visual styles (shadows, borders, rounding) of `NewAppointmentModal`.
- Implement a paginated dashboard popup carousel at `/inicio` for onboarding messages.
- Provide a simple admin UI in `/admin` to broadcast manual system notices.

**Non-Goals:**

- Setting up real-time WebSockets connections (polling is sufficient for the MVP).
- Sound or browser push notifications.

## Decisions

### 1. Database Schema

We will add a PostgreSQL-backed `Alert` table using Prisma:

```prisma
enum AlertType {
  EMERGENTE
  AVISO
  NOTIFICACION
}

model Alert {
  id          String    @id @default(uuid())
  type        AlertType
  title       String
  description String
  isRead      Boolean   @default(false)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}
```

Creating individual user alerts simplifies the read tracking (toggling `isRead` is a direct update on a single row ID).

### 2. Backend Routes (`/api/alerts`)

- `GET /api/alerts`: Fetches all alerts for the logged-in user (ordered by `createdAt DESC`).
- `PUT /api/alerts/:id/read`: Marks a single alert as read.
- `PUT /api/alerts/read-all`: Marks all alerts for the user as read.
- `POST /api/alerts`: Broadcasts a new alert to a set of target users (ADMIN role only).

### 3. Frontend Bell Dropdown (Header.tsx)

- Replaces the default button. Uses a state variable `isNotificationOpen` to toggle visibility.
- Matches `NewAppointmentModal` design tokens: `bg-white`, `border border-outline-variant`, `rounded-2xl`, `shadow-xl`.
- Layout:
  - Header: Clean title ("Alertas") and close icon `X` on the top right.
  - Section 1 (Pinned): Pinned carousel representing unread `EMERGENTE` alerts.
  - Section 2 (Scrollable): List of `AVISO` (colored warning borders) and `NOTIFICACION` (standard borders) alerts. Read alerts are rendered with opacity-50 (dimmed).

### 4. Dashboard Carousel modal (/inicio)

- Rendered on mount if the user has unread `EMERGENTE` alerts.
- Controls include pagination dots and an "Entendido" button.
- Clicking "Entendido" fires a `PUT /api/alerts/:id/read` API call, updates local state, and slides to the next alert.

## Risks / Trade-offs

- **[Risk] DB Polling Overhead** → _Mitigation:_ The frontend will poll `/api/alerts` every 30 seconds. To minimize database load, the endpoint queries PostgreSQL utilizing the index on `userId`.
- **[Risk] General broadcast overhead** → _Mitigation:_ System-wide broadcasts (from the admin view) will spawn rows for all targeted users. In production, this can be offloaded to a background worker to avoid blocking the main server thread.
