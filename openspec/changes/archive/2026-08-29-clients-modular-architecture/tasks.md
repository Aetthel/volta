## 1. Extracción de Custom Hook de Clientes

- [x] 1.1 Crear `frontend/lib/hooks/useClientsList.ts` con estado, búsqueda normalizada, LOPD filtering y paginación

## 2. Creación de Componentes Modulares de Clientes

- [x] 2.1 Crear `frontend/components/clients/ClientFiltersBar.tsx` (búsqueda, selector de columnas, filtro LOPD, exportación CSV)
- [x] 2.2 Crear `frontend/components/clients/ClientPagination.tsx` (navegación de páginas y selector de filas)
- [x] 2.3 Crear `frontend/components/clients/ClientsTable.tsx` (renderizado de filas, avatares y acciones rápidas)

## 3. Compactación de `clientes/page.tsx`

- [x] 3.1 Refactorizar `frontend/app/(dashboard)/clientes/page.tsx` integrando los nuevos componentes (< 220 líneas)

## 4. Verificación y Validación

- [x] 4.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 4.2 Validar OpenSpec con `openspec validate`
