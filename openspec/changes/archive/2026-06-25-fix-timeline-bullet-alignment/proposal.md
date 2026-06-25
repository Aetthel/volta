## Why

Corregir la alineación horizontal de los nodos circulares del timeline en el dashboard, los cuales se muestran desplazados a la derecha debido a un conflicto de la propiedad CSS `translate` en Tailwind v4 al combinar `translate-x` y `translate-y` en el mismo elemento.

## What Changes

- Modificar la posición del nodo del timeline usando `-left-[29px]` sin traducción horizontal (`translate-x-1/2`), logrando una alineación geométrica exacta de los círculos con la línea vertical.

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `appointment-management`: Ajuste de la visualización geométrica del timeline en el panel de control de citas diarias.

## Impact

- `frontend/app/inicio/page.tsx`: Modificación de la clase de posición del nodo circular en el listado de citas.
