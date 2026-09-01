## 1. Creación de Submódulos de Negocio

- [x] 1.1 Crear `frontend/components/settings/business/BusinessGeneralForm.tsx` (datos, logo, reservas públicas, QR)
- [x] 1.2 Crear `frontend/components/settings/business/BusinessHoursGrid.tsx` (horarios comerciales)
- [x] 1.3 Crear `frontend/components/settings/business/BusinessServicesCatalog.tsx` (catálogo y CRUD de servicios)

## 2. Refactorización del Orquestador `BusinessSection.tsx`

- [x] 2.1 Refactorizar `frontend/components/settings/BusinessSection.tsx` como orquestador limpio (< 50 líneas)

## 3. Verificación y Validación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar OpenSpec con `openspec validate`
