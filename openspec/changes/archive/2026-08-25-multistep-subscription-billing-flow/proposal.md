## Why

Actualmente Volta cuenta con la definición de planes en su base de datos, pero carece de un flujo de contratación y cobro autónomo para los negocios. Al no estar constituidos como empresa jurídica y estar en fase de lanzamiento, gestionar manualmente la facturación y la recaudación/declaración de IVA en España y la Unión Europea acarrearía una gran carga burocrática y riesgo fiscal.

Para resolver esto, se adopta un modelo de **Merchant of Record (MoR)** utilizando **Lemon Squeezy**, quien actúa como vendedor legal intermediario, calcula y recauda automáticamente el IVA correspondiente, emite las facturas legales oficiales con su propia entidad y gestiona los cobros recurrentes, el periodo de prueba (trial de 14 días) y los periodos de gracia ante fallos de cobro.

## What Changes

- **Modal de Checkout Guiado / Overlay de Lemon Squeezy (`SubscriptionCheckoutModal`)**:
  - **Paso 1 (Plan y Resumen)**: Selección del plan mensual (Básico 18€/mes vs Pro 25€/mes), soporte de códigos de descuento promocionales y visualización de beneficios.
  - **Paso 2 (Datos del Negocio)**: Confirmación de datos de contacto y facturación del negocio para sincronizarlos con la orden.
  - **Paso 3 (Pago Seguro con Lemon Squeezy MoR)**: Apertura del overlay de pago seguro de Lemon Squeezy (tarjetas de crédito/débito, Apple Pay, Google Pay, PayPal) con gestión fiscal del IVA automática y soporte para modo pruebas (test mode).
  - **Paso 4 (Confirmación y Activación Inmediata)**: Recepción del estado de éxito, actualización reactiva del plan a `ACTIVE` y refresco de sesión en NextAuth.
- **Gestión del Ciclo de Vida y Políticas**:
  - **Trial de 14 Días**: Si el usuario introduce su método de pago durante los 14 días de prueba, se respetan los días restantes sin realizar cargos hasta que venza el periodo gratuito.
  - **Bloqueo por Expiración**: Si el periodo de prueba finaliza sin método de pago registrado, el sistema bloquea el acceso a las funciones del panel y despliega el modal de contratación.
  - **Periodo de Gracia de 3 Días**: Ante fallo en la renovación mensual, se concede un margen de 3 días con banner de advertencia antes de suspender el acceso.
  - **Cancelación**: Botón en Ajustes para cancelar la suscripción, manteniendo el servicio activo hasta el último día del ciclo mensual facturado.
- **Pestaña de Facturación y Suscripción en Ajustes**:
  - Estado del plan actual, fecha de renovación, enlace al portal de gestión de cliente de Lemon Squeezy y tabla de facturas históricas con enlace directo de descarga al PDF legal emitido por el MoR.
- **Backend y Webhooks de Lemon Squeezy**:
  - Endpoint `/api/backend/webhooks/lemonsqueezy` para procesar eventos (`subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_payment_success`, `subscription_payment_failed`).
  - Endpoint `/api/backend/subscription/checkout` para generar URLs de checkout personalizadas con metadata del `businessId`.
  - Proveedor simulado para desarrollo local offline cuando no haya API keys configuradas.

## Capabilities

### New Capabilities
- `subscription-billing-checkout`: Flujo de checkout con Lemon Squeezy (Merchant of Record), gestión automática de IVA, ciclo de vida de suscripciones (trial, bloqueo, gracia de 3 días, cancelación) y descarga de facturas legales oficiales.

### Modified Capabilities
- `business-settings`: Incorpora la pestaña de suscripción, acceso al portal de facturación y visualización/descarga de facturas generadas por Lemon Squeezy.
- `landing-page`: Conecta las tarjetas de la tabla de precios con el flujo de contratación con Lemon Squeezy.

## Impact

- **Frontend**: Componente `SubscriptionCheckoutModal`, script del SDK Lemon.js para overlay modal in-app, pestaña de facturación en ajustes.
- **Backend (Express + Prisma)**: Modelo `Invoice` en `schema.prisma`, campos `lemonSqueezyCustomerId` y `lemonSqueezySubscriptionId` en `Business`, manejador de webhooks con firma criptográfica HMAC.
- **Variables de Entorno**: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`, IDs de variantes de producto (Básico y Pro).
