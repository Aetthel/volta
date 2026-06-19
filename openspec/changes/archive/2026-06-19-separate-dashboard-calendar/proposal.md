## Why

Currently, the home page (/inicio) displays both high-level business metrics and a heavy weekly/daily calendar grid. This causes vertical scrolling issues and visual clutter. Separating the calendar into its own dedicated full-page screen (/agenda) and transforming the home page (/inicio) into a pure, clean dashboard with compact widgets (like today's appointment list, service rankings, and WhatsApp status) improves agenda usability and business reporting clarity.

## What Changes

- **Dedicated Agenda Page**: Create a new route `/agenda` in `frontend/app/agenda/page.tsx` containing the full-screen visual calendar.
- **Pure Business Dashboard**: Refactor `/inicio` in `frontend/app/inicio/page.tsx` to display key metrics, a chronological timeline list of today's appointments, client counts, popular services, and a WhatsApp connectivity widget.
- **Navigation Update**: Add "Agenda" to the main `Sidebar` and mobile `BottomNav` components.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `reusable-ui-components`: Update navigation structures (`Sidebar` and `BottomNav`) to include the "Agenda" entry.
- `appointment-management`: Transition the visual agenda grid to its own dedicated `/agenda` route, and create a compact "Citas de Hoy" timeline component on the main `/inicio` dashboard.

## Impact

- `frontend/components/Sidebar.tsx` & `frontend/components/BottomNav.tsx`: Add the "Agenda" route links with a Lucide Calendar icon.
- `frontend/app/inicio/page.tsx`: Replace the calendar grid with widgets: compact today's appointment timeline, popular services ranking, and WhatsApp gateway status indicators.
- `frontend/app/agenda/page.tsx`: Relocate the weekly/daily calendar grid, hover guides, and context menus to this dedicated page.
