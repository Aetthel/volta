## 1. Extracción de Custom Hook de Sedes

- [x] 1.1 Crear `frontend/lib/hooks/useLocationsList.ts` con estado, búsqueda, llamadas a `apiClient` y gestión de trabajadores

## 2. Creación de Componentes Modulares de Sedes

- [x] 2.1 Crear `frontend/components/sedes/LocationCard.tsx` (ficha de sede, estado y acciones)
- [x] 2.2 Crear `frontend/components/sedes/LocationModal.tsx` (formulario de alta/edición de sede)
- [x] 2.3 Crear `frontend/components/sedes/LocationWorkersModal.tsx` (gestión de equipo por sede)

## 3. Refactorización de `sedes/page.tsx`

- [x] 3.1 Refactorizar `frontend/app/sedes/page.tsx` como orquestador limpio (< 140 líneas)

## 4. Verificación y Validación

- [x] 4.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 4.2 Validar OpenSpec con `openspec validate`
