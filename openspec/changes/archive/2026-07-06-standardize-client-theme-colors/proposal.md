## Why

The current client management page uses hardcoded Tailwind CSS color classes (such as `emerald-600` and `amber-600`) for LOPD consent statuses, WhatsApp action icons, and notification toast text colors. This violates the "Clinical Elegance" design system guidelines and compromises theme coherence and visual maintainability.

## What Changes

- **LOPD Status Colors Alignment**: Map LOPD status visual indicators to existing design system variables: LOPD Aceptado to `primary` (Teal), and LOPD Pendiente to `error` (Rose/Red).
- **Toast Notifications Standardization**: Align toast alert text and icon colors with the secondary container background (`bg-secondary-container`, `text-on-secondary-container`, and `text-secondary` for icons) to ensure accessible contrast and branding consistency.
- **WhatsApp Action Icons**: Standardize WhatsApp quick action icons to use the system `primary` color instead of hardcoded `emerald-600`.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `stitch-design-migration`: Align LOPD status displays, toast alerts, and external brand icons with the existing Material Design 3 theme system.

## Impact

- `frontend/app/clientes/page.tsx`: Replaced hardcoded `emerald` and `amber` colors with existing semantic tokens (`primary`, `secondary`, `error`, `on-secondary-container`).
