## Why

There are several visual and structural discrepancies between the implementation and the design system guidelines defined in `DESIGN.md`. These include mismatched primary colors, incorrect corner radii (border-radius) for inputs and cards, hardcoded color hex values in custom components, and duplicated toast alert implementations. Standardizing these elements ensures visual alignment with the "Clinical Elegance" guidelines and improves style maintainability.

## What Changes

- **Primary Colors Harmonization**: Update the `--color-primary` and `--color-primary-container` variables in `globals.css` to match the exact hex codes specified in `DESIGN.md` (`#006565` and `#008080`).
- **Border-Radius Alignments**: Update input fields (`FloatingInput`, `Select`, `Textarea`) in `volta-ui.tsx` to use `rounded-sm` (4px). Update the `Card` component in `volta-ui.tsx` to use `rounded-default` (8px).
- **Component Styling Standards**: Re-map hardcoded hex colors and slate classes inside custom components (`MetricCard`, `WeeklyPerformanceChart`, `FeaturedServicesList`, `UpcomingAppointmentsList`) to standard CSS variables.
- **Modal Toast Alert Cleanup**: Update the toast container layout inside `NewAppointmentModal.tsx` to align with the theme container tokens.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `reusable-ui-components`: Align border radius, input shapes, card classes, and alert styles with the design system.
- `stitch-design-migration`: Harmonize core primary and primary-container color variables, and clean up hex colors in custom components.

## Impact

- `frontend/app/globals.css`
- `frontend/components/ui/volta-ui.tsx`
- `frontend/components/MetricCard.tsx`
- `frontend/components/WeeklyPerformanceChart.tsx`
- `frontend/components/FeaturedServicesList.tsx`
- `frontend/components/UpcomingAppointmentsList.tsx`
- `frontend/components/NewAppointmentModal.tsx`
