## Why

The frontend codebase currently lacks a centralized, reusable `Button` component in `volta-ui.tsx`, forcing developers to write raw `<button>` elements with inline Tailwind styles. This leads to duplicate classes, inconsistent sizes (padding, font sizes), varying cancellation styles, and conflicting font weights. Standardizing buttons under a unified `Button` component will improve DRY compliance, clean up frontend code, and enforce consistent design choices like using a clean `font-medium` weight and avoiding heavy bold typography.

## What Changes

- **Centralize Button component**: Introduce a reusable `Button` component in `volta-ui.tsx` with unified variant configurations (`primary`, `outline`, `ghost`) and sizes (`sm`, `md`, `lg`).
- **Standardize typography**: Enforce `font-medium` typography across all buttons, avoiding heavy bold text styles (`font-bold` or `font-semibold`) in line with styling guidelines.
- **Refactor all modals**: Replace raw HTML buttons in `AddClientModal.tsx`, `AddServiceModal.tsx`, and `NewAppointmentModal.tsx` (including close buttons) with the standardized `<Button />` component.
- **Refactor remaining routes and views**: Replace inline buttons in `clientes/page.tsx`, `inicio/page.tsx`, `Sidebar.tsx`, `ajustes/page.tsx`, `sedes/page.tsx`, `login/page.tsx`, `lopd/[id]/page.tsx`, `error.tsx`, `not-found.tsx`, `admin/page.tsx`, and `Header.tsx` with the new component.

## Capabilities

### New Capabilities

<!-- None: This refactoring aligns existing components to a common standard. -->

### Modified Capabilities

- `reusable-ui-components`: Shared button layouts and interaction controls must utilize standard Volta UI button variants and standard font weight sizes.

## Impact

- `frontend/components/ui/volta-ui.tsx`: Exports a new `<Button />` component.
- `frontend/components/AddClientModal.tsx`: Uses `<Button />` for submit/cancel actions.
- `frontend/components/AddServiceModal.tsx`: Uses `<Button />` for submit/cancel actions.
- `frontend/components/NewAppointmentModal.tsx`: Uses `<Button />` for submit/cancel actions.
- `frontend/components/Sidebar.tsx`: Refactors bottom call-to-action to use the standard button.
- `frontend/app/clientes/page.tsx` & `frontend/app/inicio/page.tsx`: Replaces raw inline buttons.
