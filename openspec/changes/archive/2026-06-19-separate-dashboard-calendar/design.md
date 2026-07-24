## Context

Currently, `frontend/app/inicio/page.tsx` serves as both a high-level metrics dashboard and a full calendar grid. This leads to scrolling issues and screen congestion. Separating the two concerns makes the visual grid easier to use and enables `/inicio` to focus purely on high-level store stats and quick action workflows.

## Goals / Non-Goals

**Goals:**

- Add "Agenda" links to `Sidebar` and `BottomNav` components.
- Relocate the complete weekly/daily agenda calendar grid to `frontend/app/agenda/page.tsx`.
- Redesign `frontend/app/inicio/page.tsx` to display statistics cards, a compact timeline list of today's appointments, a WhatsApp bot status widget, and a popular services ranking.

**Non-Goals:**

- Modifying backend APIs or database schemas.
- Adding third-party UI libraries (keep Tailwind CSS v4 styling rules).

## Decisions

### 1. Dedicated Agenda Page (`/agenda`)

We will create `frontend/app/agenda/page.tsx` by copying the layout and code of the agenda visual grid from `inicio/page.tsx`. This page will contain the week/day toggle, hover booking guides, coordinates logic, and the context menu triggers for empty slots and appointment cards.

### 2. Streamlined Dashboard Page (`/inicio`)

We will refactor `frontend/app/inicio/page.tsx` to remove the calendar grid rendering code. In its place:

- **Hoy**: A vertical timeline list of today's appointments sorted by start time. When clicked, it displays quick actions.
- **WhatsApp Status Widget**: Displays if the WhatsApp Bot is connected/disconnected (fetching status from `/api/backend/whatsapp/status` if available, or simulation fallback matching existing code).
- **Ranking of Services**: A card rendering service counts or prices from today's active services.

### 3. Navigation Update

We will update `Sidebar.tsx` and `BottomNav.tsx` navigation arrays to insert `{ name: "Agenda", href: "/agenda", icon: Calendar }` right below the "Inicio" item.

## Risks / Trade-offs

- **[Risk]**: Users might expect to edit appointments from both `/inicio` and `/agenda`.
  - _Mitigation_: Both pages will import and use `NewAppointmentModal` to handle bookings and edits consistently.
