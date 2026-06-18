## Why

The frontend modal components (`AddClientModal.tsx`, `AddServiceModal.tsx`, and `NewAppointmentModal.tsx`) currently use raw HTML `<input>` elements and repeat Tailwind form-control classes. Standardizing these inputs to use the unified `FloatingInput` and custom UI layout components from `volta-ui.tsx` will clean up duplicated CSS/JSX, improve codebase maintainability, and ensure form controls align with Volta UI design tokens.

## What Changes

- **Standardize form inputs**: Refactor text and select inputs in `AddClientModal.tsx`, `AddServiceModal.tsx`, and `NewAppointmentModal.tsx` to use the unified `FloatingInput` component.
- **Enforce layout rules**: Enforce using `FieldGroup`, `Field`, and `FieldLabel` for all form groupings, replacing raw divs and spacing classes.
- **Refactor icons and addons**: Integrate leading icons and clean layouts in forms using standard Volta configurations.

## Capabilities

### New Capabilities

<!-- None: Refactoring focuses on component clean-up and styling alignment. -->

### Modified Capabilities

- `reusable-ui-components`: Form inputs within interactive creation modales must utilize standard Volta UI floating-label controls to maintain visual and functional consistency.

## Impact

- `frontend/components/AddClientModal.tsx`: Inputs replaced with `FloatingInput` component.
- `frontend/components/AddServiceModal.tsx`: Inputs replaced with `FloatingInput` component.
- `frontend/components/NewAppointmentModal.tsx`: Inputs replaced with `FloatingInput` component.
- `frontend/components/ui/volta-ui.tsx`: Potential small cleanup/enhancement for select/textarea fields if needed.
