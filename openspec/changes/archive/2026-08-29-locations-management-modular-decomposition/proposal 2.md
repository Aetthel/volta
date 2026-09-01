## Why

La vista de administración multi-sede (`frontend/app/sedes/page.tsx`) contiene 854 líneas mezclando la lista de establecimientos, formularios modales anidados de creación de sede y gestión modal de trabajadores por sede con llamadas directas `fetch`. Descomponer esta vista en un custom hook (`useLocationsList`) y componentes atómicos en `frontend/components/sedes/` mejorará significativamente la modularidad del código.

## What Changes

- **Extracción de Custom Hook `useLocationsList`**: Encapsular el estado de sedes, búsqueda, CRUD y gestión de trabajadores por sede en `frontend/lib/hooks/useLocationsList.ts` consumiendo `apiClient`.
- **Descomposición en Submódulos en `frontend/components/sedes/`**:
  - `LocationCard.tsx`: Tarjeta visual de sede con información de contacto, rol y acciones rápidas.
  - `LocationModal.tsx`: Diálogo para crear o editar establecimientos comerciales.
  - `LocationWorkersModal.tsx`: Modal para gestionar y asignar trabajadores a una sede específica.
- **Orquestación Limpia**: Reducir `sedes/page.tsx` a un orquestador limpio (< 140 líneas).

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `admin-business-control`: Modularización del gestor de sedes y asignación multi-establecimiento.

## Impact

- **Frontend**: `frontend/app/sedes/page.tsx`, `frontend/components/sedes/`, `frontend/lib/hooks/useLocationsList.ts`.
- **Mantenibilidad**: Reducción de 854 líneas a módulos desacoplados y uso del cliente tipado `apiClient`.
