## ADDED Requirements

### Requirement: Capa Centralizada de Cliente HTTP Tipado
El frontend SHALL canalizar las peticiones de red hacia el backend mediante la instancia de `apiClient` (`frontend/lib/apiClient.ts`), proporcionando tipado estricto, serialización automática y propagación de errores estandarizada.

#### Scenario: Petición de datos de clientes o citas
- **WHEN** un hook o vista solicita recursos al backend (ej. `apiClient.get<ClientItem[]>('/clients')`)
- **THEN** la respuesta se deserializa de forma segura y devuelve `{ data, error, status }` sin necesidad de envoltorios `fetch` manuales
