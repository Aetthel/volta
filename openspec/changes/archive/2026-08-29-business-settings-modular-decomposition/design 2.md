## Context

`frontend/components/settings/BusinessSection.tsx` contenía 983 líneas con tres formularios complejos interactuando con distintos endpoints (`/api/backend/business`, `/api/backend/business/:id/hours`, `/api/backend/services`).

## Goals / Non-Goals

**Goals:**
- Separar `BusinessSection.tsx` en `BusinessGeneralForm`, `BusinessHoursGrid` y `BusinessServicesCatalog` bajo `frontend/components/settings/business/`.
- Mantener la integridad del estado compartido mediante callbacks y props tipadas.

**Non-Goals:**
- No modificar contratos de endpoints REST.

## Decisions

1. **Directorio `frontend/components/settings/business/`**:
   - `BusinessGeneralForm.tsx` (Información del negocio + Enlace público + QR).
   - `BusinessHoursGrid.tsx` (Gestión de días de apertura/cierre y horarios).
   - `BusinessServicesCatalog.tsx` (Listado y CRUD de servicios).

## Risks / Trade-offs

- Ninguno. Reorganización modular limpia y compatible.
