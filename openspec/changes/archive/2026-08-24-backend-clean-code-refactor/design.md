## Context

El backend Express de Volta contiene controladores en `backend/src/controllers/`. Muchos de ellos implementan validaciones manuales repetitivas y bloques `try/catch` extensos.

Esta propuesta aplica las pautas de `code-refactor` para simplificar la estructura de los controladores mediante la introducción de un middleware de errores y la limpieza de código duplicado.

## Goals / Non-Goals

**Goals:**
- Crear middleware centralizado de errores en `backend/src/middlewares/errorHandler.js`.
- Refactorizar controladores principales (`appointmentsController.js`, `clientsController.js`, `servicesController.js`) con cláusulas de guarda.
- Eliminar importaciones y variables no utilizadas.

**Non-Goals:**
- Reescribir esquemas de base de datos en Prisma o alterar rutas de Express.

## Decisions

### Decision 1: Async Handler Wrapper / Middleware Centralizado
- **Opción Elegida**: Usar un wrapper o middleware centralizado para capturar promesas rechazadas en Express 5.
- **Razón**: Elimina la necesidad de envolver cada controlador en bloques `try/catch` idénticos.

## Risks / Trade-offs

- [Riesgo] Modificar las respuestas de error esperadas por el frontend.
  → *Mitigación*: Preservar la estructura `{ error: message }` existente en todas las respuestas de error.
