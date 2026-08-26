## Context

Volta cuenta con una arquitectura monorepo basada en Next.js (App Router, React 19) en el frontend y Express con Prisma ORM (PostgreSQL) en el backend. Para evitar la carga tributaria y burocrática de constituir una empresa emisora de facturas con IVA en España/UE, se adopta **Lemon Squeezy como Merchant of Record (MoR)**. Lemon Squeezy actúa como el vendedor legal, recauda el IVA correspondiente según la ubicación del comprador y emite facturas legales oficiales con enlaces directos en PDF.

Ver `proposal.md` para el contexto y motivación del cambio.

## Goals / Non-Goals

**Goals:**
- Integrar Lemon Squeezy (Merchant of Record) para la gestión integral de suscripciones mensuales (Básico 18€/mes y Pro 25€/mes), cálculo de IVA y facturación legal.
- Implementar el componente modal `SubscriptionCheckoutModal` con integración de Lemon.js (Overlay Checkout) para una experiencia de pago dentro de la aplicación.
- Extender el esquema Prisma con el modelo `Invoice` y campos de referencia `lemonSqueezyCustomerId`, `lemonSqueezySubscriptionId`, `gracePeriodExpiresAt` y `cancelAtPeriodEnd` en `Business`.
- Implementar el manejador de webhooks seguro en backend (`POST /api/backend/webhooks/lemonsqueezy`) con validación de firma HMAC SHA-256.
- Desarrollar la pestaña "Facturación y Suscripción" en Ajustes (`/ajustes`) con estado del plan, enlace al portal del cliente de Lemon Squeezy y tabla de facturas oficiales en PDF.
- Implementar un proveedor simulado (mock) para desarrollo local offline sin necesidad obligatoria de claves de API.

**Non-Goals:**
- Emisión manual de facturas fiscales propias desde el backend (delegado 100% en Lemon Squeezy MoR).
- Facturación anual o suscripciones complejas por volumen en esta fase (solo mensual: 18€/mes Básico y 25€/mes Pro).

## Decisions

### Decisión 1: Integración con Lemon Squeezy como Merchant of Record (MoR)

- **Venta y Fiscalidad**: Lemon Squeezy es el vendedor oficial en el comprobante fiscal, recaudando y liquidando el IVA europeo (MOSS/OSS).
- **Facturas**: Cada webhook de cobro exitoso aporta un `invoice_url` oficial generado por Lemon Squeezy que se almacena en la tabla `Invoice` para descarga directa por el cliente.

### Decisión 2: Flujo de Checkout en Frontend (Lemon.js Overlay)

- **Modal Guiado de Volta (`SubscriptionCheckoutModal`)**:
  - Permite al usuario revisar el plan, introducir cupones promocionales y ver el resumen mensual.
  - Al pulsar "Proceder al Pago Seguro", se llama al backend `POST /api/backend/subscription/checkout-url` para crear la sesión de checkout personalizada de Lemon Squeezy vinculada al `businessId`.
  - Se abre el Checkout Overlay de `Lemon.js` en pantalla sin redirigir al usuario fuera de Volta.
  - Al completarse el pago, `Lemon.js` emite el evento `LemonSqueezy.Event.CheckoutSuccess`, refrescando la sesión en NextAuth y mostrando la confirmación en Volta.

### Decisión 3: Arquitectura de Webhooks y Sincronización

- Endpoint `POST /api/backend/webhooks/lemonsqueezy`:
  - Valida el header `x-signature` calculando el HMAC SHA-256 del raw body con `LEMONSQUEEZY_WEBHOOK_SECRET`.
  - `subscription_created` / `subscription_payment_success`: Actualiza `subscriptionPlan`, `subscriptionStatus = 'ACTIVE'`, resetea `gracePeriodExpiresAt` y guarda la factura en `Invoice`.
  - `subscription_payment_failed`: Marca `gracePeriodExpiresAt = now() + 3 días`.
  - `subscription_cancelled`: Marca `cancelAtPeriodEnd = true` respetando la fecha de expiración pagada.

### Decisión 4: Modo Desarrollo / Test Local

- Si no hay `LEMONSQUEEZY_API_KEY` configurada, el backend activa automáticamente el modo simulado de prueba local que aprueba la transacción y registra una factura de prueba en BD, garantizando que el equipo pueda testear y desarrollar sin conexión externa obligatoria.

## Risks / Trade-offs

- **[Riesgo] Retardo en la entrega de webhooks de Lemon Squeezy** → *[Mitigación]* El evento `CheckoutSuccess` en el frontend actualiza temporalmente el estado en cliente y realiza un polling suave de verificación al backend para asegurar una experiencia instantánea.
