## Context

El backend de Volta requiere una gestión uniforme de errores y validación declarativa con Zod.

## Goals / Non-Goals

**Goals:**
- Implementar `AppError` en `backend/src/utils/appError.js`.
- Enriquecer `backend/src/middleware/errorHandler.js` y `backend/src/middleware/validation.js`.
- Exportar en `backend/src/utils/index.js` y `backend/src/middleware/index.js`.

**Non-Goals:**
- No alterar las respuestas públicas para no romper el contrato del cliente frontend.

## Decisions

1. **`AppError`**:
   - `constructor(message, statusCode = 500, details = null)`
   - `isOperational = true`
2. **Middlewares de Validación Zod**:
   - `validateBody(schema)`
   - `validateQuery(schema)`
   - `validateParams(schema)`

## Risks / Trade-offs

- Ninguno. 100% compatible.
