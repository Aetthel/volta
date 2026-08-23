## Why

El código del frontend presenta acumulación de deuda técnica, lógica mezclada dentro de componentes de UI (modales, páginas y vistas de dashboard), duplicación de patrones de manejo de estado/peticiones y anidamiento complejo que afecta su legibilidad y mantenibilidad.

Aplicar una refactorización guiada por la skill `code-refactor` bajo principios Clean Code, SOLID y DRY permitirá separar la lógica de negocio en custom hooks dedicados, eliminar código muerto o redundante y simplificar los componentes para que sean exclusivamente de presentación.

## What Changes

- **Extracción de Lógica de Negocio a Custom Hooks**: Extraer llamadas a API, estado de formularios y validaciones de los componentes grandes (`AddClientModal`, `AddServiceModal`, `NewAppointmentModal`, etc.) hacia custom hooks reutilizables.
- **Reducción de Anidamiento y Complejidad Ciclomática**: Aplicar cláusulas de guarda (*guard clauses*) y retornos tempranos (*early returns*) en componentes y manejadores de eventos.
- **Limpieza de Code Smells y Código Muerto**: Eliminar importaciones no utilizadas, variables obsoletas y comentarios redundantes en el frontend.
- **Normalización de Manejo de Errores y Estado de Carga**: Estandarizar la gestión de loading y feedback de error utilizando utilidades UI unificadas.

## Capabilities

### New Capabilities
- `frontend-clean-architecture`: Estándares de arquitectura limpia, separación de UI vs Hooks/Estado y refactorización de componentes clave del frontend.

### Modified Capabilities
<!-- No requirement changes to existing specs -->

## Impact

- **Código Afectado**: Componentes UI en `frontend/components/` y páginas en `frontend/app/`.
- **API & Interfaces**: Cero cambios rompientes en la API pública ni en las props exportadas de componentes principales.
- **Testing & Calidad**: Mejora la testabilidad de hooks y componentes de manera aislada.
