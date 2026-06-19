## Why

The frontend codebase contains several inconsistencies and code smells that violate the styling standards defined in [GEMINI.md](file:///Users/kore/Documents/Code/Projects/volta/GEMINI.md):
- **Utility and Custom Layout Duplication**: Raw `<button>` and `<input>` elements are used in screens like `clientes/page.tsx`, `login/page.tsx`, and `sedes/page.tsx` instead of reusing the unified UI components defined in `volta-ui.tsx`.
- **Custom Notification Toast Duplication**: Inconsistent HTML structure and custom colors are used for alert overlays, instead of reusing the standard `<Alert>` component.
- **Icon Sizing Classes**: Explicit sizing classes (e.g., `w-4 h-4`, `w-5 h-5`) are hardcoded on Lucide icons, overriding/redundantly duplicating the global stylesheet definition (`globals.css`) that styles icons automatically using `[data-icon]`.
- **Limitation of the `cn` Helper**: The utility function `cn` in `lib/utils.ts` does not resolve tailwind class overrides properly (due to missing `tailwind-merge` and `clsx` libraries), resulting in potential design layout bugs.

## What Changes

- **Update Class Name Combiner**: Install `clsx` and `tailwind-merge` dependencies, and update `frontend/lib/utils.ts` to implement standard merging behavior.
- **Unify Button and Form Layouts**: Refactor raw `<button>` and `<input>` elements in `clientes/page.tsx`, `sedes/page.tsx`, and `login/page.tsx` to utilize `Button` and `FloatingInput` / `Select` from `volta-ui.tsx`.
- **Ender Custom Error/Alert States**: Map manual error banners and toast overlays (e.g. in `sedes/page.tsx`, `clientes/page.tsx`, and `NewAppointmentModal.tsx`) to standard `<Alert>` component instances.
- **Standardize Icon Sizes**: Clean up hardcoded sizing classes from Lucide icons inside components/buttons and assign `data-icon` attributes to align with `globals.css`.

## Capabilities

### New Capabilities

<!-- None: Refactoring focuses on code cleanup, design alignment, and styling helper robustness. -->

### Modified Capabilities

- `reusable-ui-components`: UI components must strictly adhere to Volta UI tokens, using standard components (`Button`, `FloatingInput`, `Alert`, `Card`) and standard icon attribute configurations.

## Impact

- `frontend/package.json`: Add dependencies `clsx` and `tailwind-merge`.
- `frontend/lib/utils.ts`: Update `cn` utility to utilize `twMerge` and `clsx`.
- `frontend/app/clientes/page.tsx`: Replace raw `<button>` elements and toast divs with `<Button>` and `<Alert>`.
- `frontend/app/sedes/page.tsx`: Replace raw inputs/error panels with standard `<FloatingInput>` and `<Alert>` components.
- `frontend/app/login/page.tsx`: Wrap password/email with `<InputGroup>` and replace wrapper divs.
- `frontend/components/Header.tsx`, `frontend/components/Sidebar.tsx`, `frontend/components/BottomNav.tsx`, `frontend/app/inicio/page.tsx`: Standardize icon declarations to use `data-icon` instead of explicit sizing classes.
