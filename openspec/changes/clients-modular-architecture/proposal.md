## Why

La vista de gestión de clientes (`frontend/app/(dashboard)/clientes/page.tsx`) ha crecido hasta 1.056 líneas, conteniendo en un solo archivo la tabla, la barra de filtros de búsqueda, la paginación, el modal de consentimientos LOPD, el modal de mensajería directa y la lógica de mutaciones CRUD. Descomponer esta vista en módulos atómicos y un custom hook especializado mejorará la legibilidad, facilitará el mantenimiento y optimizará el rendimiento de re-renderizado.

## What Changes

- **Extracción del Custom Hook `useClientsList`**: Centralizar estado de clientes, conteo de citas, normalización de búsqueda, filtrado por estado LOPD, paginación y mutaciones en `frontend/lib/hooks/useClientsList.ts`.
- **Descomposición de Componentes en `frontend/components/clients/`**:
  - `ClientFiltersBar.tsx`: Buscador, selector de columnas visibles, filtro LOPD y botón de exportación CSV.
  - `ClientsTable.tsx`: Renderizado modular de filas, avatares, estados de carga (Skeleton) y acciones rápidas.
  - `ClientPagination.tsx`: Controles accesibles de cambio de página y selector de elementos por página.
  - `ClientLopdModal.tsx`: Modal con auditoría de consentimiento legal, logs IP y reenvío de solicitud.
  - `ClientDirectMessageModal.tsx`: Diálogo para envío directo de WhatsApp.
- **Compactación de `clientes/page.tsx`**: Reducir el orquestador principal a menos de 200 líneas limpias.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `project-modular-structure`: Desacoplamiento de la arquitectura de la vista de gestión de clientes.

## Impact

- **Frontend**: `frontend/app/(dashboard)/clientes/page.tsx`, `frontend/components/clients/`, `frontend/lib/hooks/useClientsList.ts`.
- **Mantenibilidad**: Reducción de 1.056 líneas a submódulos altamente cohesivos con 0 impacto en la experiencia de usuario.
