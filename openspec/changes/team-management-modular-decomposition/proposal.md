## Why

La vista de gestión de equipo (`frontend/app/(dashboard)/equipo/page.tsx`) concentra 704 líneas de código integrando lógica de búsqueda, filtrado por rol, paginación, renderizado de tablas, control de permisos y llamadas REST en un único archivo. Descomponer esta vista en un custom hook y componentes atómicos en `frontend/components/team/` aumentará la mantenibilidad y consistencia del código.

## What Changes

- **Extracción de Custom Hook `useTeamList`**: Encapsular el estado de miembros, carga asíncrona, filtrado normalizado, paginación y mutaciones CRUD en `frontend/lib/hooks/useTeamList.ts`.
- **Descomposición en Submódulos en `frontend/components/team/`**:
  - `TeamFiltersBar.tsx`: Barra de búsqueda, selector de rol y selector de columnas.
  - `TeamTable.tsx`: Renderizado de filas de trabajadores, badges de rol (ADMIN, JEFE, EMPLEADO), estados de carga y acciones protegidas.
  - `TeamPagination.tsx`: Barra de paginación accesible.
- **Orquestador `equipo/page.tsx`**: Reducir el orquestador principal a menos de 150 líneas limpias.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `admin-business-control`: Modularización del módulo de gestión de equipo y asignación de roles.

## Impact

- **Frontend**: `frontend/app/(dashboard)/equipo/page.tsx`, `frontend/components/team/`, `frontend/lib/hooks/useTeamList.ts`.
- **Mantenibilidad**: Reducción de 704 líneas a módulos altamente cohesivos.
