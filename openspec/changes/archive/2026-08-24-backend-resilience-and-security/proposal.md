## Why

El backend actual presenta vulnerabilidades potenciales por falta de validación estricta de variables de entorno al arranque, ausencia de esquemas Zod en endpoints públicos (`/api/public/booking`) y falta de estrategias de reconexión exponencial (*backoff*) en Redis y cierres limpios (*graceful shutdown*) en Express/Prisma.

Implementar estas mejoras de seguridad y resiliencia garantizará que el backend falle de forma predecible al arrancar si faltan secretos, resista caídas temporales de Redis sin colapsar BullMQ y se detenga limpiamente sin dejar conexiones colgadas en Postgres.

## What Changes

- **Validación Estricta de Configuración**: Validación con Zod de variables de entorno obligatorias (`BACKEND_JWT_SECRET`, `DATABASE_URL`, `REDIS_HOST`, etc.) durante la inicialización del servidor.
- **Resiliencia de Redis**: Configuración de `retryStrategy` con *backoff* exponencial en ioredis.
- **Graceful Shutdown**: Manejadores de eventos para señales `SIGINT` y `SIGTERM` que cierren limpiamente la aplicación Express y las conexiones de Prisma y Redis.
- **Esquemas Zod en Booking Público**: Validación estricta con Zod para las solicitudes a `/api/public/booking`.

## Capabilities

### New Capabilities
- `backend-security-and-resilience`: Estándares de seguridad de secretos, resiliencia de Redis y apagado controlado del servidor.

### Modified Capabilities
<!-- No requirement changes -->

## Impact

- **Código Afectado**: `backend/src/config/index.js`, `backend/src/config/redis.js`, `backend/src/index.js` y `backend/src/controllers/publicBookingController.js`.
- **API**: Respuestas de error estandarizadas para solicitudes con cuerpo inválido.
- **Fiabilidad**: Resistencia ante caídas de infraestructura y reinicios en contenedores.
