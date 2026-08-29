## Why

A medida que Volta ha crecido en funcionalidades, ciertos componentes clave y controladores han acumulado alta complejidad cognitiva, métodos extensos y lógica de negocio acoplada directamente a las capas de presentación. Aplicar un refactor sistemático de *Clean Code* (según el catálogo de Martin Fowler, principio DRY, guard clauses y extracción de custom hooks) mejorará la legibilidad, mantenibilidad y modularidad de la base de código sin alterar su comportamiento externo.

## What Changes

- **Descomposición de Componentes Monolíticos**: Extraer subcomponentes especializados y custom hooks reutilizables de componentes de gran tamaño como `EventManager.tsx` (`useCalendarNavigation`, `useCalendarFilters`, vistas individuales de calendario).
- **Aplicación Universal de Guard Clauses y Early Returns**: Aplanar estructuras anidadas de control de flujo (`if-else` profundos) en manejadores de eventos, controladores de Express y transformaciones de datos.
- **Eliminación de Duplicación de Lógica (DRY)**: Centralizar utilidades comunes de formateo de fecha, cálculo de duración y sanitización de cadenas en módulos de soporte en `@/lib/` y `backend/src/utils/`.
- **Nombres Descriptivos y Tipado Coherente**: Homogeneizar nombres de variables, funciones y propiedades para que comuniquen su propósito exacto sin ambigüedad.

## Capabilities

### New Capabilities
<!-- No new capabilities needed -->

### Modified Capabilities
- `project-modular-structure`: Refactorización de la cohesión interna de módulos y desacoplamiento de capas de lógica y vista.

## Impact

- **Frontend**: `frontend/components/EventManager.tsx`, `frontend/components/calendar/`, `frontend/lib/`.
- **Backend**: `backend/src/controllers/`, `backend/src/utils/`.
- **Mantenibilidad**: Reducción drástica del tamaño de archivos y complejidad ciclomática.
