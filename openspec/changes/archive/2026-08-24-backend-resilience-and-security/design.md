## Context

El backend requiere hardening en la gestión de secretos, la resiliencia de Redis frente a micro-cortes y la desconexión limpia en infraestructuras de contenedores.

## Goals / Non-Goals

**Goals:**
- Validar `.env` al arranque con Zod.
- Reintento con backoff en ioredis.
- Graceful shutdown con `process.on('SIGTERM')`.
- Sanitización de peticiones en reserva pública.

**Non-Goals:**
- Modificar esquemas de Prisma.

## Decisions

### Decision 1: Zod Schema Config Validation
- **Opción Elegida**: Validar `process.env` con un esquema Zod centralizado al cargar `backend/src/config/index.js`.
- **Razón**: Evita fallos sutiles en runtime causados por secretos no definidos.
