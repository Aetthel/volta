## Why

Currently, our modal forms (e.g., `NewAppointmentModal` and `AddClientModal`) use outlined input containers that clutter the visual layout. Also, the backdrop blur adds compositing complexity in Safari. We want a cleaner, professional row-based design (similar to Google Calendar) where inputs are borderless, aligned with leading icons, and scale their border-radius dynamically in response to the user's settings.

## What Changes

- **Core UI Updates**: Update core components (`FloatingInput`, `Combobox`, and `FloatingTextarea`) in `volta-ui.tsx` to support a borderless `"minimal"` variant.
- **Dynamic Scale Support**: Ensure all rounded container borders inside modals and buttons scale dynamically with the user's `--radius-scale` settings rather than hardcoding static classes (like `rounded-full` or `rounded-2xl`).
- **Combobox Customization**: Support a `searchable={false}` configuration in `Combobox` to hide the text-filtering search box for simple selection rows (like Hour and Minute).
- **Appointment Modal Refactoring**: Re-arrange `NewAppointmentModal.tsx` into a minimalist icon-driven list of rows, with a large name title and clean date/time button lines.
- **Client Modal Refactoring**: Refactor `AddClientModal.tsx` using the same row-based minimal structure.
- **Backdrop Overlays**: Replace dark blurry overlays with a clean light translucent background overlay (`bg-black/5` or `bg-transparent`) that disables interaction without hiding the underlying page content.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `reusable-ui-components`: Refactor modal creation forms to use row-based layouts, and modify core UI inputs to support borderless styling and scalable border roundness.

## Impact

- `frontend/components/ui/volta-ui.tsx`: Core input components.
- `frontend/components/NewAppointmentModal.tsx`: Creation modal for appointments.
- `frontend/components/AddClientModal.tsx`: Creation modal for clients.
