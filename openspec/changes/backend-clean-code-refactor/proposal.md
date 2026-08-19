## Why

Los controladores del backend en `backend/src/controllers/` están implementados en JavaScript sin verificación estricta de tipos de TypeScript y contienen bloques `try/catch` redundantes con lógica de respuesta duplicada sin middleware global de manejo de errores.

Aplicar los principios de la skill `code-refactor` (Clean Code, SOLID y resguardo de tipos) mejorará la estabilidad del servidor Express, eliminará código repetitivo y prevendrá errores en tiempo de ejecución.

## What Changes

- **Middleware Global de Manejo de Errores**: Implementar un middleware unificado para capturar excepciones en controladores Express sin envolver cada endpoint en `try/catch` repetitivos.
- **Refactorización de Controladores Clave**: Aplicar cláusulas de guarda (*guard clauses*) y validación de esquemas con Zod en `appointmentsController.js`, `clientsController.js`, `servicesController.js` y `userController.js`.
- **Limpieza de Parámetros y Funciones Muertas**: Eliminar utilidades o variables sin uso en `backend/src/controllers/` y `backend/src/services/`.

## Capabilities

### New Capabilities
- `backend-clean-architecture`: Estándares de arquitectura limpia, manejo unificado de errores y tipado/validación estricta en el backend.

### Modified Capabilities
<!-- No requirement changes -->

## Impact

- **Código Afectado**: Controladores en `backend/src/controllers/` y servicios en `backend/src/services/`.
- **API & Endpoints**: Cero cambios en las rutas, parámetros de entrada o formato de respuestas JSON exportadas.
- **Calidad & Robustez**: Prevención de fallos silenciosos y respuestas unificadas de error HTTP (400, 404, 500).
