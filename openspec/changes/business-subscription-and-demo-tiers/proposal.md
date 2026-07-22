## Why

Actualmente Volta posee una lógica parcial e inconsistente de demos y planes (días de prueba variables entre 10 y 14 días, roles ambiguos, sin aislamiento entre demos rápidas y usuarios registrados). Para escalar el producto comercialmente, es necesario estructurar un modelo claro de 4 capas: Modo Demo Efímero (20 min sin registro), Prueba Gratuita de 14 Días (Plan Pro completo), Plan Base (18€/mes) y Plan Pro (25€/mes), garantizando un aislamiento estricto en la base de datos y control de accesos basado en límites.

## What Changes

- **Modo Demo Efímero (20 min)**: Creación de un sandbox temporal auto-limpiable que expira en 20 minutos sin necesidad de registro ni perseverancia de datos personales.
- **Trial de 14 Días**: Estandarización de 14 días de prueba completa de características Pro tras el registro en `/register`, con transición automática a estado `TRIAL_EXPIRED` al vencer.
- **Diferenciación Plan Base vs Plan Pro**:
  - **Plan Base (18€/mes)**: 1 Sede activa, hasta 3 miembros del equipo, agenda, clientes y servicios ilimitados, recordatorios estándar.
  - **Plan Pro (25€/mes)**: Multisede ilimitada, equipo ilimitado, vinculación WhatsApp QR activa con respuestas automáticas, analíticas avanzadas, personalización visual completa y exportación LOPD.
- **Control de límites y Middleware de suscripción**: Interceptación de acciones (crear sedes, añadir empleados, activar WhatsApp) para validar los límites de la suscripción del negocio.

## Capabilities

### New Capabilities
- `demo-sandbox`: Modo demo efímero de 20 minutos con limpieza automática y entorno aislado para visitantes.
- `subscription-tier-management`: Motor de control de suscripciones, límites por plan (Base vs Pro) y manejo del ciclo de vida del Trial (14 días).

### Modified Capabilities
<!-- No requirement changes to existing specs -->

## Impact

- **Base de Datos (Prisma)**: Campos en `Business` (`subscriptionPlan` ENUM 'BASE'|'PRO', `subscriptionStatus` ENUM 'DEMO_SANDBOX'|'TRIAL'|'ACTIVE'|'EXPIRED'|'CANCELLED', `trialExpiresAt`, `sandboxExpiresAt`).
- **Middleware del Backend**: Validación de permisos y cuotas según el plan antes de permitir crear sedes, invitar usuarios o conectar WhatsApp.
- **Frontend / UI**: Modales de actualización a Pro cuando el negocio alcanza los límites del Plan Base o cuando el Trial vence.
