## Why

To make the calendar view more useful, readable, and highly optimized for all screen sizes, the page header ("Agenda" title and description) should be removed, and the calendar component should be remodeled to occupy 100% of the viewport height and width (full-bleed layout). In addition, the navigation controls and day highlights should match the provided Luxe Salon layout design reference.

## What Changes

- **Layout Remodeling in `app/agenda/page.tsx`**:
  - Remove the `<PageHeader>` component completely.
  - Remove the outer `<Card>` component wrapper.
  - Expand `<main>` to a full-bleed grid that spans 100% height and width.
- **Controls & Navigation Headers**:
  - Center and group the week range selector next to the month heading: `< Semana 16 - 22 >` and add an outline-style `Hoy` button.
  - Implement a Stylist dropdown selector ("Todos los Estilistas") dynamically filtered by users from the database.
- **Active Day Column Highlights**:
  - Format the weekday header row: Highlight the active day with a clean teal background circle for the day number, a teal day name, and a teal bottom border on the cell.
- **Hour Labels and current time indicator**:
  - Align hour text labels vertically to the top of each hour block.
  - Implement a global current time horizontal red line across all columns, with a red dot placed on the left vertical axis.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `stitch-design-migration`: Redesign the calendar view to be full-bleed and introduce stylist dropdown filters.

## Impact

- `frontend/app/agenda/page.tsx`
