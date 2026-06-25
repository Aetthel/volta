## Why

Estandarizar el espaciado (gaps y márgenes) del dashboard utilizando los tokens de diseño de la marca (`gutter`) para lograr consistencia visual en los ejes X e Y, y hacer el código más escalable y mantenible.

## What Changes

- Reemplazar las clases de espaciado estáticas (`gap-3`, `gap-4`, `gap-6`, `mb-8`) en el panel de control por el token semántico `--spacing-gutter` (`gap-gutter`, `mb-gutter`) definido en el sistema de diseño.
- Garantizar que los espacios verticales entre secciones y los espacios horizontales entre tarjetas sean exactamente iguales (`24px`).

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `appointment-management`: Ajustes en la consistencia de rejilla y espaciados del panel de control de citas diarias.

## Impact

- `frontend/app/inicio/page.tsx`: Reemplazo de las clases de margen inferior y gaps en la estructura del layout.
