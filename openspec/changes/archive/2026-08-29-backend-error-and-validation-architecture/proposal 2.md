## Why

Actualmente en el backend (`backend/src/`), algunos controladores manejan errores y respuestas HTTP de forma manual (`res.status(403).json(...)` o `try/catch` dispersos) en lugar de apoyarse en una jerarquía tipada de errores operacionales y middlewares de validación declarativa con Zod. Centralizar `AppError`, `asyncHandler` y middlewares de validación (`validateBody`, `validateQuery`, `validateParams`) estandarizará las respuestas de la API REST.

## What Changes

- **Clase de Error Operacional `AppError`**: Crear `backend/src/utils/appError.js` con código de estado HTTP, mensaje y metadatos.
- **Middleware de Errores Enriquecido**: Actualizar `backend/src/middleware/errorHandler.js` para capturar `AppError`, errores de Zod, Prisma y sintaxis JSON de forma uniforme.
- **Middlewares de Validación Universales**: Extender `backend/src/middleware/validation.js` con `validateBody`, `validateQuery`, `validateParams` y validación de IDs UUID/CUID.
- **Exportación en `backend/src/utils/index.js` y `backend/src/middleware/index.js`**.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `external-prod-redis-postgres`: Manejo robusto de errores operacionales y validación de esquemas en Express.

## Impact

- **Backend**: `backend/src/utils/appError.js`, `backend/src/middleware/errorHandler.js`, `backend/src/middleware/validation.js`, `backend/src/utils/index.js`.
- **Mantenibilidad**: Eliminación de código repetitivo de validación y control de errores manual en los controladores de Express.
