## Context

El frontend tenía llamadas `fetch` sin tipos unificados y con manejo de errores heterogéneo.

## Goals / Non-Goals

**Goals:**
- Extender `frontend/lib/apiClient.ts` con tipado exhaustivo, namespaces de dominio y `ApiError`.
- Refactorizar hooks clave (`useClientsList.ts`, `useTeamList.ts`) y componentes de ajustes para consumir `apiClient`.

**Non-Goals:**
- No modificar el proxy de Next.js (`/api/backend/*`) ni endpoints de Express en `backend/`.

## Decisions

1. **Estructura de `apiClient`**:
   - `apiClient.get<T>(url, params, options)`
   - `apiClient.post<T>(url, body, options)`
   - `apiClient.put<T>(url, body, options)`
   - `apiClient.delete<T>(url, options)`
   - Namespaces tipados: `apiClient.clients`, `apiClient.appointments`, `apiClient.services`, `apiClient.users`, `apiClient.whatsapp`.

## Risks / Trade-offs

- Ninguno. La respuesta normalizada `{ data, error, status }` previene excepciones no controladas en componentes cliente.
