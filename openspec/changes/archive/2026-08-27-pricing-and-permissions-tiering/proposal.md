# Propuesta: Actualización de Precios y Sistema de Permisos por Planes (Básico 30€ vs Pro 40€)

## Why

Volta necesita actualizar su estructura de precios y empaquetado de funcionalidades para reflejar la propuesta de valor comercial definitiva y asegurar un modelo de negocio sostenible:
- **Plan Básico a 30€/mes**: Diseñado para profesionales individuales o pequeños centros que inician su digitalización sin fricciones (1 trabajador incluido, 1 calendario/sede, hasta 100 reservas online/mes, recordatorios email/SMS).
- **Plan Pro a 40€/mes**: Diseñado para negocios en crecimiento que demandan automatización avanzada, multi-calendario/multi-sede, bot de WhatsApp bidireccional, cobro de señas/pagos online, analítica de negocio completa y soporte prioritario.
- **Add-on de Trabajadores (+5€/mes por trabajador adicional)**: Flexibilidad para escalar equipos tanto en Básico (a partir del 2º) como en Pro (a partir del 3º).

Asimismo, es imprescindible establecer una matriz de permisos y control de accesos estricta tanto a nivel de **Plan de Negocio** (qué funciones están desbloqueadas según la suscripción) como a nivel de **Rol de Usuario** (`JEFE` vs `EMPLEADO` vs `ADMIN`).

## What Changes

1. **Estructura de Precios y Cuotas**:
   - **Básico (30€/mes)**:
     - 1 trabajador incluido (+5€/mes por trabajador extra).
     - 1 calendario / 1 sede única.
     - Página de reservas online con marca propia (límite de 100 reservas online/mes).
     - Recordatorios automáticos por Email y SMS.
     - Soporte estándar por Email.
   - **Pro (40€/mes)**:
     - 2 trabajadores incluidos (+5€/mes por trabajador extra).
     - Multi-calendario y multi-sede ilimitado.
     - Bot de WhatsApp interactivo bidireccional con confirmación/cancelación automática.
     - Pasarela de pagos online para cobro de señas y depósitos.
     - Gestión avanzada de clientes (historial completo, notas enriquecidas, LOPD avanzado).
     - Panel de analítica de negocio (ingresos, ocupación, rendimiento).
     - Soporte prioritario por chat.

2. **Control de Acceso y Middleware de Límites en Backend**:
   - Actualización de `subscriptionMiddleware.js` para aplicar las nuevas reglas de bloqueo y cuotas:
     - `INVITE_WORKER`: Comprobación de trabajadores incluidos según plan y cálculo de slots adicionales.
     - `MULTI_LOCATION` / `MULTI_CALENDAR`: Bloqueo en Básico si ya existe 1 sede/calendario.
     - `WHATSAPP_CONNECT`: Bloqueo en Básico con retorno de `requiresUpgrade: true`.
     - `ONLINE_PAYMENTS`: Restricción de configuración de señas en Básico.
     - `PUBLIC_BOOKING_QUOTA`: Contador mensual de 100 citas en Básico.
   - Actualización de `subscriptionService.js` con las nuevas tarifas (30€ y 40€) y parámetros de checkout en Lemon Squeezy.

3. **Módulo de Permisos y Experiencia de Usuario en Frontend**:
   - Utilidad centralizada `lib/permissions.ts` con helpers tipados (`hasFeatureAccess`, `canUserPerform`, `getPlanLimits`).
   - Actualización de `SubscriptionCheckoutModal.tsx` con los nuevos precios, cálculo interactivo de trabajadores (+5€/mes) y selector de planes.
   - Actualización de `UpgradeProModal.tsx` y `BillingSection.tsx` con la nueva comparativa.
   - Modales y banners de advertencia informativos ante límites de cupo alcanzados.
   - Actualización de la tabla de precios y beneficios en la Landing Page.

## Capabilities

### Modified Capabilities
- `subscription-billing-checkout`: Actualización de tarifas mensuales (Básico 30€, Pro 40€), cálculo de add-ons de trabajadores (+5€) y sincronización con Lemon Squeezy.
- `multitenant-core`: Reglas de acceso por plan para sedes múltiples, límite de reservas online y cuotas de trabajadores.
- `whatsapp-integration`: Gating estricto del bot y conexión de WhatsApp exclusivo para el Plan Pro.
- `business-settings`: Gestión de facturación actualizada, visualización de límites activos y permisos diferenciados por rol (`JEFE` vs `EMPLEADO`).

## Impact

- **Frontend**: Componentes de facturación, modales de suscripción/upgrade, landing page y sistema de protección de rutas y acciones en interfaz.
- **Backend**: Middlewares de Express, endpoints de suscripción, controladores de usuarios/trabajadores y sedes.
- **Base de Datos**: Modelos `Business` y `User` validados contra las nuevas reglas de negocio.
