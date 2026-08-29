## 1. Extracción de Custom Hook de Equipo

- [x] 1.1 Crear `frontend/lib/hooks/useTeamList.ts` con estado, búsqueda normalizada, filtrado de roles y paginación

## 2. Creación de Componentes Modulares de Equipo

- [x] 2.1 Crear `frontend/components/team/TeamFiltersBar.tsx` (búsqueda, selector de rol, columnas visibles, invitar trabajador)
- [x] 2.2 Crear `frontend/components/team/TeamPagination.tsx` (navegación y conteo de páginas)
- [x] 2.3 Crear `frontend/components/team/TeamTable.tsx` (filas de miembros, badges de rol, acciones de edición/eliminación protegidas)

## 3. Refactorización de `equipo/page.tsx`

- [x] 3.1 Refactorizar `frontend/app/(dashboard)/equipo/page.tsx` integrando los nuevos submódulos (< 150 líneas)

## 4. Verificación y Validación

- [x] 4.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 4.2 Validar OpenSpec con `openspec validate`
