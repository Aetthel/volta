## Purpose

Provides a guided subscription checkout integration with Lemon Squeezy (Merchant of Record) handling global/EU VAT compliance, coupon validation, trial lifecycle, 3-day grace period, and official invoice downloads.

## ADDED Requirements

### Requirement: Modal de Checkout de Suscripción con Lemon Squeezy
El sistema SHALL presentar un modal interactivo (`SubscriptionCheckoutModal`) que guíe al usuario en la selección del plan mensual (Básico 18€/mes o Pro 25€/mes), aplicación de cupones y lanzamiento del overlay seguro de pago de Lemon Squeezy (Merchant of Record).

#### Scenario: Apertura del modal con plan preseleccionado
- **WHEN** un usuario autenticado activa la contratación o actualización de plan (desde el banner de trial, ajustes o avisos de límite)
- **THEN** el sistema abre el modal de checkout con el plan correspondiente preseleccionado y muestra el resumen mensual.

#### Scenario: Lanzamiento del checkout overlay de Lemon Squeezy
- **WHEN** el usuario confirma el plan y pulsa en "Proceder al Pago Seguro"
- **THEN** el sistema genera la sesión de checkout mediante la API de Lemon Squeezy y despliega el overlay de pago seguro dentro de la aplicación.

### Requirement: Gestión Fiscal y de IVA por Merchant of Record
El sistema SHALL delegar el cálculo, recaudación y declaración del IVA/tax a Lemon Squeezy, quien actuará como vendedor legal y emisor fiscal de la transacción.

#### Scenario: Cálculo automático de impuestos en el checkout
- **WHEN** el cliente introduce su país y código postal en la pasarela de Lemon Squeezy
- **THEN** la pasarela calcula y añade automáticamente el tipo de IVA correspondiente (ej. 21% en España) sin requerir intervención del backend de Volta.

### Requirement: Respeto al Periodo de Prueba (Trial de 14 Días)
El sistema SHALL configurar las suscripciones de Lemon Squeezy para respetar los días restantes de prueba gratuita del negocio antes de realizar el primer cargo.

#### Scenario: Registro de método de pago durante el periodo de prueba
- **WHEN** un negocio dentro de sus 14 días de prueba suscribe un plan
- **THEN** Lemon Squeezy valida el método de pago con un cargo de 0,00€ y programa el primer cobro automático para la fecha exacta de expiración del trial.

### Requirement: Bloqueo por Expiración de Trial y Periodo de Gracia de 3 Días
El sistema SHALL bloquear el acceso al panel si el periodo de prueba finaliza sin suscripción activa, y conceder un periodo de gracia de 3 días con avisos destacados ante fallos en la renovación.

#### Scenario: Expiración del periodo de prueba sin suscripción
- **WHEN** un negocio supera los 14 días de trial sin haber configurado una suscripción activa
- **THEN** el sistema bloquea la navegación habitual y muestra la pantalla/modal de contratación de plan para desbloquear la cuenta.

#### Scenario: Fallo de cobro recurrente con periodo de gracia
- **WHEN** Lemon Squeezy emite el webhook `subscription_payment_failed`
- **THEN** el sistema entra en estado de gracia durante 3 días, mostrando una alerta destacada solicitando actualizar la tarjeta antes de suspender el acceso.

### Requirement: Procesamiento de Webhooks de Lemon Squeezy
El sistema SHALL verificar la firma criptográfica HMAC de los webhooks entrantes de Lemon Squeezy y sincronizar el estado del negocio (`subscriptionPlan`, `subscriptionStatus = ACTIVE` | `CANCELLED` | `EXPIRED`).

#### Scenario: Activación exitosa de suscripción vía webhook
- **WHEN** el webhook `subscription_created` o `subscription_payment_success` es recibido con firma válida
- **THEN** el backend actualiza el estado del negocio a `ACTIVE`, registra la referencia de la suscripción y almacena la factura con su URL de descarga.

### Requirement: Historial y Descarga de Facturas Emitidas por el MoR
El sistema SHALL registrar las facturas emitidas por Lemon Squeezy y permitir a los administradores y jefes acceder al documento PDF oficial con validez legal.

#### Scenario: Descarga de factura legal
- **WHEN** un usuario con rol `JEFE` o `ADMIN` pulsa en "Descargar Factura" en el listado de facturas
- **THEN** el sistema redirige o descarga el PDF oficial emitido por Lemon Squeezy con el desglose legal y fiscal completo.
