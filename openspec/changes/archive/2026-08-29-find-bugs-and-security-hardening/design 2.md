## Context

El controlador `webhookController.js` procesa eventos asíncronos de Evolution API (`messages.upsert`, `connection.update`, `qrcode.updated`). En `messages.upsert`, si la búsqueda de la cita retornaba `null`, `targetUserId` quedaba indefinido y las alertas no se creaban.

## Goals / Non-Goals

**Goals:**
- Añadir fallback de recuperación de usuario por `businessId` en `handleWhatsAppWebhook`.
- Asegurar que no existan excepciones no controladas en el parsing de mensajes.

**Non-Goals:**
- No cambiar la arquitectura de webhooks ni el clasificador de intenciones.

## Decisions

1. **Resolución en Dos Pasos de `targetUserId`**:
   - Paso 1: Usuario vinculado a la cita encontrada (`appointment?.business?.users?.[0]?.id`).
   - Paso 2: Fallback consultando `prisma.user.findFirst({ where: { businessId } })`.

## Risks / Trade-offs

- Ninguno. Mejora la fiabilidad del sistema de alertas en un 100%.
