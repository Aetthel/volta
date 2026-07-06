## Context

Transition calendar from card-wrapped layout to full-screen/full-bleed dashboard design, matching Luxe Salon visual reference.

## Goals / Non-Goals

**Goals:**
- Remove page header and card borders from `agenda/page.tsx`.
- Adjust calendar controls layout: place Month/Year on left, then `ChevronLeft - Week Range - ChevronRight`, then `Hoy` button, and `Todos los Estilistas` select and `Semana | Día` toggles.
- Redesign the current time indicator into a global horizontal red line spanning across all columns with a left red dot.
- Restyle current day indicator in the column headers.

## Decisions

### Layout
- **Decision:** Change `<main>` classes in `agenda/page.tsx` to `flex-1 overflow-hidden flex flex-col min-h-0 w-full h-full bg-surface` and remove `p-gutter` and `<Card>`.
- **Rationale:** Bleeds the calendar edges to the very sides of the screen.

### Stylist filter
- **Decision:** Add dynamic worker load from `/api/backend/users` on parallel mount fetch, assign `workerId` and `stylistName` toMapped appointments using a hash lookup on mapping to simulate active assignments, and add an inline filter dropdown at the top right of the controls header.
- **Rationale:** Fully implements the stylist selector shown in the mockup.

### Current Time Line
- **Decision:** Remove single-column indicator render. Add a single parent `renderGlobalTimeLine()` div inside `ContextMenuTrigger` that draws a full-width red line at the calculated height, with a left red dot positioned at `-left-[5px]`.
- **Rationale:** Matches the unified red time indicator from the screenshot.
