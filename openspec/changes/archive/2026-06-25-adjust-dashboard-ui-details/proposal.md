## Why

Ajustar detalles visuales del panel de control de citas diarias para mejorar la consistencia visual y la alineación matemática de la línea de tiempo.

## What Changes

- Reducir la redondez de los bordes en las citas de hoy a la redondez estándar.
- Eliminar la barra de color del servicio a la izquierda de las citas de hoy.
- Ocultar el badge de estado cuando la cita está "Pendiente" (PENDING).
- Sincronizar y alinear perfectamente los círculos (nodos) de la línea de tiempo con la línea vertical utilizando traslaciones CSS.

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `appointment-management`: Ajuste del requisito "Panel de Control de Citas de Hoy en Dashboard" para reflejar los cambios en bordes, estado y alineación de línea de tiempo.

## Impact

- `frontend/app/inicio/page.tsx`: Modificaciones en las clases CSS del listado de citas y la lógica de renderizado del estado badge.
