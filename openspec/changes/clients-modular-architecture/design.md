## Context

`frontend/app/(dashboard)/clientes/page.tsx` contenía 1.056 líneas de código combinando estado, filtros, lógica de normalización de cadenas y teléfonos, maquetación de tablas, tres modales y llamadas a la API.

## Goals / Non-Goals

**Goals:**
- Extraer `useClientsList` con estado reactivo de clientes, búsqueda con debounce/normalización y conteo de citas.
- Modularizar `ClientFiltersBar`, `ClientsTable`, `ClientPagination`, `ClientLopdModal` y `ClientDirectMessageModal` en `frontend/components/clients/`.
- Mantener intactas todas las funcionalidades (exportar CSV, reenviar LOPD, agendar cita rápida, copiar link de firma).

**Non-Goals:**
- No alterar contratos de API backend ni endpoints de Express.

## Decisions

1. **Directorio `frontend/components/clients/`**:
   - Agrupa los componentes de UI específicos del dominio de clientes.
2. **Hook `useClientsList`**:
   - Encapsula llamadas fetch, mutaciones optimistas y estados de carga.

## Risks / Trade-offs

- Ninguno. La modularización conserva exactamente las mismas interfaces de props y llamadas API.
