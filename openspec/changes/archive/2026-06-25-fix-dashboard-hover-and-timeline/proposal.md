## Why

Ajustar detalles visuales finales en el dashboard para mejorar la precisión del timeline bajo la escala base de 18px (rem) y eliminar efectos hover innecesarios en las tarjetas de métricas.

## What Changes

- Rediseñar el nodo del timeline usando un contenedor absoluto de tamaño cero (`w-0 h-0`) centrado para evitar conflictos con la propiedad `translate` en Tailwind v4, logrando alineación matemática exacta con la línea vertical.
- Eliminar los efectos hover (escala, sombras y cambio de borde) de las tarjetas de métricas (`MetricCard`).

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `appointment-management`: Ajustes en la precisión visual de la línea de tiempo en el panel de control.
- `reusable-ui-components`: Eliminación de los estilos hover interactivos en el componente `MetricCard`.

## Impact

- `frontend/app/inicio/page.tsx`: Modificación de la estructura del nodo del timeline.
- `frontend/components/MetricCard.tsx`: Modificación de las clases del contenedor para eliminar efectos hover.
