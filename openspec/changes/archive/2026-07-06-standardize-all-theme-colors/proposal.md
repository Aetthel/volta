## Why

Many main pages (Inicio, Agenda, Ajustes) and the UI primitive `Alert` still contain raw hex color values and hardcoded Tailwind color classes (like `slate`, `emerald`, `amber`). This breaks design system consistency and degrades maintainability.

## What Changes

- **Inicio Page Color Standardization**: Replace hex colors like `#005d63` and `#b2f1e8` with `primary`, `secondary-container`, and `on-secondary-container`. Replace hardcoded `slate` text and border classes with dynamic theme tokens like `on-surface`, `on-surface-variant`, and `outline-variant`.
- **Agenda Actions Standardization**: Re-map action status icons (confirm, pending) to theme-aligned variables (`primary` and `error`).
- **Ajustes Layout Standardisation**: Update settings component fallbacks and status indicators from hardcoded Tailwind classes to standard system colors.
- **Alert Primitive cleanup**: Standardize `Alert` variants (`success`, `warning`) to use theme tokens (`secondary-container` / `on-secondary-container` and `surface-container` / `on-surface-variant`).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `stitch-design-migration`: Align all other screens and UI primitives with the existing DESIGN.md theme tokens.

## Impact

- `frontend/app/inicio/page.tsx`
- `frontend/app/agenda/page.tsx`
- `frontend/app/ajustes/page.tsx`
- `frontend/components/ui/volta-ui.tsx`
