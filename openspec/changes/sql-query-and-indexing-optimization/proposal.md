## Why

Para garantizar tiempos de respuesta por debajo de 50ms y prevenir cuellos de botella a medida que aumente el volumen de citas y clientes, es indispensable auditar y optimizar las estrategias de indexación en PostgreSQL mediante Prisma, asegurar la indexación compuesta de claves foráneas tenant (`businessId`) con campos de ordenación (`appointmentDate`, `createdAt`) y evitar sobrecargas de I/O innecesarias.

## What Changes

- **Auditoría de Índices Compuestos en Prisma**: Verificar que todas las consultas de tenant (`Appointment`, `Client`, `Service`, `Alert`) aprovechen índices compuestos con prefijo de partición (`businessId`).
- **Proyecciones Selectivas (Evitar SELECT *)**: Emplear cláusulas `select` explícitas en consultas de verificación de solapamiento y validación de horarios para reducir transferencia de datos de base de datos.
- **Prevención de Problemas N+1**: Utilizar `include` optimizado en consultas relacionales en un único ciclo de red.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `project-modular-structure`: Optimización de acceso a datos y rendimiento de consultas SQL multitenant.

## Impact

- **Database Performance**: Consultas con ejecución Index Scan directo en PostgreSQL sin escaneos secuenciales completos.
