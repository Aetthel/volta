## Context

Volta atiende a diferentes tipos de negocios (peluquerías, clínicas, fitness, consultoría). Para rentabilizar la plataforma y ofrecer una incorporación fluida, debemos articular 4 estados bien definidos:
1. **Modo Demo Efímero (20 min)**: Sandbox rápido sin registro.
2. **Trial Gratuito (14 días)**: Prueba completa Plan Pro tras registro.
3. **Plan Base (18€/mes)**: 1 Sede, 3 usuarios.
4. **Plan Pro (25€/mes)**: Multisede, usuarios ilimitados, WhatsApp QR automático y analíticas LOPD.

## Goals / Non-Goals

**Goals:**
- Implementar un modelo de datos robusto en Prisma para controlar el plan y estado de suscripción.
- Crear un middleware de backend (`checkSubscriptionLimits`) que restrinja acciones según el plan (ej. crear >1 sede en Plan Base).
- Implementar el Sandbox Efímero de 20 minutos para visitantes sin registro.
- Proveer componentes en el frontend para mostrar alertas de expiración de trial y modals de actualización a Pro.

**Non-Goals:**
- Integración inmediata de pasarela de pago real (Stripe/Paypal) en esta fase (se gestiona vía estado de suscripción en BD/Admin).

## Decisions

### Decisión 1: Modelo de datos en Prisma (`Business` y `SubscriptionStatus`)
- `subscriptionPlan`: ENUM ('BASE', 'PRO'). Default: 'PRO' en Trial.
- `subscriptionStatus`: ENUM ('DEMO_SANDBOX', 'TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED').
- `trialExpiresAt`: Timestamp de finalización de los 14 días.
- `sandboxExpiresAt`: Timestamp de finalización del Sandbox de 20 min.

### Decisión 2: Middleware de validación de cuotas (`checkSubscriptionLimits`)
- En endpoints críticos (ej. `POST /api/sedes`, `POST /api/users`), el backend consultará el plan del negocio.
- Si el plan es 'BASE' y se intenta crear una 2ª sede o un 4º usuario, se devolverá HTTP 403 con error traducido y flag `requiresUpgrade: true`.

### Decisión 3: Modo Demo Efímero (Sandbox)
- Endpoint `POST /api/backend/demo/sandbox` genera un negocio temporal `isDemo = true`, `subscriptionStatus = 'DEMO_SANDBOX'`, con expira a `Date.now() + 20 * 60 * 1000`.
- Un cron/script periódico o middleware invalida la sesión si `Date.now() > sandboxExpiresAt`.

## Risks / Trade-offs

- [Riesgo] Usuario en Trial o Plan Base intenta realizar una acción bloqueada → [Mitigación] Mostrar un modal visual en el frontend explicando los beneficios del Plan Pro y facilitando la actualización.
- [Riesgo] Expiración de los 14 días interrumpe el servicio → [Mitigación] La cuenta entra en modo `EXPIRED` de solo lectura durante 7 días antes de archivar.
