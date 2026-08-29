## Context

`frontend/app/sedes/page.tsx` contenía 854 líneas mezclando tres modales interactivos y renderizado de tarjetas en un único archivo.

## Goals / Non-Goals

**Goals:**
- Extraer `useLocationsList.ts` con estado de sedes y llamadas tipadas a `apiClient`.
- Crear `LocationCard.tsx`, `LocationModal.tsx` y `LocationWorkersModal.tsx` en `frontend/components/sedes/`.
- Reducir `sedes/page.tsx` a un orquestador declarativo.

**Non-Goals:**
- No modificar contratos de endpoints de sedes.

## Decisions

1. **Directorio `frontend/components/sedes/`**:
   - `LocationCard.tsx`: Ficha individual de sede con badges y menú de acciones.
   - `LocationModal.tsx`: Diálogo para creación/edición de sede.
   - `LocationWorkersModal.tsx`: Diálogo para gestión de equipo adscrito a la sede seleccionada.

## Risks / Trade-offs

- Ninguno. 100% retrocompatible.
