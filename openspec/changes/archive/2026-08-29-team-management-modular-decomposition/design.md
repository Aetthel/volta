## Context

`frontend/app/(dashboard)/equipo/page.tsx` contenía 704 líneas combinando UI, estado y lógica de negocio.

## Goals / Non-Goals

**Goals:**
- Extraer `useTeamList.ts` con estado de miembros, carga de API y mutaciones.
- Crear `TeamFiltersBar.tsx`, `TeamTable.tsx` y `TeamPagination.tsx` en `frontend/components/team/`.
- Mantener la regla de seguridad que impide a un usuario eliminar su propia cuenta desde la lista.

**Non-Goals:**
- No modificar contratos de endpoints de usuarios ni roles en base de datos.

## Decisions

1. **Submódulos en `frontend/components/team/`**:
   - `TeamFiltersBar.tsx`: Barra de filtros de equipo.
   - `TeamTable.tsx`: Tabla de miembros y acciones rápidas.
   - `TeamPagination.tsx`: Paginación accesible.

## Risks / Trade-offs

- Ninguno. 100% retrocompatible.
