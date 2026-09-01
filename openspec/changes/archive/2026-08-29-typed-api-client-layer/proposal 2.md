## Why

En el frontend de Volta existen más de 25 llamadas `fetch('/api/backend/...')` distribuidas en páginas, hooks y componentes. Cada llamada repite serialización JSON, headers, control de errores `res.ok`, status codes y conversiones manuales de tipo `as T`. Esta dispersión introduce inconsistencias de manejo de errores e impide aprovechar el autocompletado y tipado estricto de TypeScript.

## What Changes

- **Evolución y Potenciación de `frontend/lib/apiClient.ts`**:
  - Clase de error tipada `ApiError(message, status, data)`.
  - Métodos HTTP enriquecidos (`get`, `post`, `put`, `patch`, `delete`) con soporte de genéricos estrictos y `AbortSignal`.
  - Módulos de dominio tipados (`apiClient.clients`, `apiClient.appointments`, `apiClient.services`, `apiClient.business`, `apiClient.team`, `apiClient.whatsapp`, `apiClient.billing`).
- **Migración Progresiva de Hooks y Secciones Clave**:
  - `useClientsList.ts` y `useTeamList.ts`.
  - Componentes de ajustes (`business/`, `messages/`, `BillingSection.tsx`).
  - Vistas principales (`agenda/page.tsx`, `inicio/page.tsx`).

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `project-modular-structure`: Capa de red centralizada, tipada y con gestión unificada de errores.

## Impact

- **Frontend**: `frontend/lib/apiClient.ts`, `frontend/lib/hooks/`, `frontend/components/`.
- **Mantenibilidad**: Eliminación de cientos de líneas de boilerplate de `fetch` repetido y prevención de llamadas a endpoints inválidos en tiempo de compilación.
