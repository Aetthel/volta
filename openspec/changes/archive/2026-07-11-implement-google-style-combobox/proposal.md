## Why

Currently, the application relies on native browser `<select>` dropdowns for critical form elements, which degrades the visual consistency of our custom theme engine. Replacing these selects with custom Google Material Design 3 (MD3) styled Combobox components will establish a premium user experience and enable real-time search filtering.

## What Changes

- Add a new, unified, searchable `Combobox` component in `volta-ui.tsx` featuring Material Design 3 curves, layouts, and animations.
- Integrate the `Combobox` component to replace native `<select>` dropdowns and `FloatingSelect` instances in:
  - New Appointment Modal (`NewAppointmentModal.tsx`)
  - Add Client Modal (`AddClientModal.tsx`)
  - Worker CRUD Modal (`ajustes/page.tsx`)
  - Stylist selector in the Agenda view (`agenda/page.tsx`)
  - Service filter in the Clientes view (`clientes/page.tsx`)
- Enhance dropdown backdrops with smooth transitions and click-outside behaviors.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `reusable-ui-components`: Add the searchable `Combobox` component to the core UI library and replace native select elements.

## Impact

- **Frontend Core Components (`volta-ui.tsx`)**: New component introduction.
- **Form Modals (`NewAppointmentModal.tsx`, `AddClientModal.tsx`, `ajustes/page.tsx`)**: Replaced select tags with the new `Combobox` component.
- **Page Layout Views (`agenda/page.tsx`, `clientes/page.tsx`)**: Updated filter dropdowns to the unified searchable combobox style.
- No database or backend API schema changes are required.
