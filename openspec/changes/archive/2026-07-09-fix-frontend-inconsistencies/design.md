## Context

The Volta frontend routes load page skeletons with empty arrays, resulting in layout shifts and misleading "No data" empty alerts while the database API queries resolve. Additionally, layout naming inconsistencies exist for the global admin dashboard, and the calendar view misses the standard PageHeader.

## Goals / Non-Goals

**Goals:**

- Provide a smooth visual loader during async data fetches in the dashboard pages using the pre-existing `<Skeleton />` component.
- Standardize the global admin page header and navigation name across mobile and desktop.
- Maintain full layout responsiveness and compile-time type safety.

**Non-Goals:**

- Refactoring the API backend endpoints or schema fields.
- Introducing a state machine or external state managers (e.g., Redux, Zustand) for page loading. Keeping state local to the page using React hooks is sufficient.

## Decisions

### Asynchronous Loading State Structure

- **Decision:** Introduce local `isLoading` state hooks in `/inicio`, `/agenda`, `/clientes`, `/sedes`, and `/admin` routes.
- **Alternative considered:** Using a global loader or router transition events (e.g. Next.js route events).
- **Rationale:** Local page states are easier to maintain, prevent full-page blocking, and allow loading skeletons to be scoped to specific widgets (e.g., loading only the upcoming appointments grid or only the metrics cards), providing a progressive rendering experience.

### Skeleton Layout Design

- **Decision:** Implement specialized skeleton loader wrappers mimicking the original cards.
  - Metrics cards: 4 horizontal skeleton blocks.
  - Weekly chart: 1 large card skeleton block.
  - Lists (Featured services, Clients, Sedes, Appointments): Pulsing items matching the exact row heights.
- **Rationale:** This minimizes layout shifts (CLS) when data mounts.

### Navigation Naming and Agenda Header

- **Decision:** Sync name to "Control Global" in `BottomNav.tsx`. Introduce a compact `<PageHeader>` in `/agenda/page.tsx` above the main card grid, setting margins so that it takes up only the necessary space.

## Risks / Trade-offs

- **Risk:** Slow APIs might keep the skeleton flashing longer.
  - _Mitigation:_ Ensure queries are efficient (indexed Prisma queries).
- **Risk:** Double render triggers.
  - _Mitigation:_ Keep state management clean, fetching once on mount in standard `useEffect` hooks.
