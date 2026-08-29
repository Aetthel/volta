## Context

En arquitecturas multitenant con partición lógica basada en `businessId`, los índices deben incorporar la columna de inquilino como primer componente en índices compuestos B-Tree para permitir saltos directos al espacio de datos de dicho negocio.

## Goals / Non-Goals

**Goals:**
- Verificar que el esquema Prisma en `backend/prisma/schema.prisma` defina índices compuestos idóneos para `Appointment`, `Client`, `User`, `Service` y `Alert`.
- Asegurar proyecciones reducidas en consultas de verificación de solapamiento.

**Non-Goals:**
- No realizar migraciones destructivas de base de datos.

## Decisions

1. **Índices Compuestos Multitenant**:
   - `Client`: `@@index([businessId, phone])`, `@@index([businessId, email])`, `@@index([businessId, lopdStatus])`.
   - `Appointment`: `@@index([businessId, appointmentDate])`, `@@index([businessId, status])`.
   - `Alert`: `@@index([userId, isRead])`.

## Risks / Trade-offs

- Ninguno. El rendimiento de consultas se maximiza manteniendo bajo overhead en escrituras.
