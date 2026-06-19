## Why

The dashboard (`/inicio`) layout is currently rigid and uses hardcoded heights and stretched nested cards. This causes empty blank space when content is small and clipping/overlap issues when larger content (like the WhatsApp Bot QR code) is displayed. Additionally, the navigation lacks proper tablet column-split wrapping.

## What Changes

- Convert `/inicio` grid to a responsive 10-column layout (`md:grid-cols-10`) that splits 6/4 starting on tablets (768px).
- Remove all height locks (`lg:h-[560px]`, `h-full`, and `flex-1`) from both columns and their internal cards, allowing each widget to size itself naturally based on its content.
- Optimize the layout behavior on mobile and tablet resolutions.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `appointment-management`: Estructura del listado de citas diarias en inicio (quitar altura fija en Y y scrolls internos).
- `reusable-ui-components`: Optimización de alineaciones del grid principal para el dashboard.

## Impact

- `frontend/app/inicio/page.tsx`
