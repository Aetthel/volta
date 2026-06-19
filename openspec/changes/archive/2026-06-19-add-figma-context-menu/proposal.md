## Why

Users currently interact with list records (such as clients) and calendar appointments through generic, three-dot drop-down menus or basic trigger points. Introducing a Figma-style, right-click context menu with desktop-native shortcuts, sleek typography, micro-animations, and a unified design system improves action efficiency. Support for mobile devices via long-press makes these quick actions accessible across all form factors.

## What Changes

- **Modified Capabilities**:
  - `reusable-ui-components`: Add a highly reusable, style-compliant `<ContextMenu>` React component and utility hook to Volta UI.
  - `appointment-management`: Enable right-click and long-press quick-actions on calendar appointments and empty time slots to edit, delete, modify status, or pre-book.
- **Client Management Table Row Context Menu**: Enable right-click and long-press on client rows to quick-edit, delete, trigger WhatsApp communications, and copy details (email, phone) to the clipboard.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `reusable-ui-components`: Add `<ContextMenu>` components (trigger, content, item, group, separator) with Figma-like aesthetics, hover states, and smooth entrance transitions.
- `appointment-management`: Implement context actions on appointments (view, edit, delete, status toggle) and empty time cells (quick-book at hovered slot).

## Impact

- `frontend/components/ui/volta-ui.tsx`: Define the `ContextMenu` components using React and clean state handlers.
- `frontend/app/clientes/page.tsx`: Integrate `ContextMenu` wrapper on each client row and handle operations (edit, delete, send LOPD/custom WhatsApp, copy phone/email).
- `frontend/app/inicio/page.tsx`: Integrate `ContextMenu` wrapper on appointment items and calendar time slot cols. Implement delete appointment, status change, and slot-prefilled booking.
