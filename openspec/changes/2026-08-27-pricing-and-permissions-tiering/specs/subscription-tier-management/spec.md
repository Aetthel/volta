## Purpose
Establece las reglas funcionales, escenarios de prueba y restricciones asociadas a los planes de suscripción (Básico 30€/mes vs Pro 40€/mes), cuotas de trabajadores (+5€ extra), límites de sedes/reservas y la matriz de permisos por rol de usuario (`ADMIN`, `JEFE`, `EMPLEADO`).

## ADDED Requirements

### Requirement: Tarifas de Planes y Add-ons de Trabajadores
El sistema SHALL configurar el Plan Básico a 30,00 €/mes con 1 trabajador incluido (+5,00 €/mes por trabajador adicional) y el Plan Pro a 40,00 €/mes con 2 trabajadores incluidos (+5,00 €/mes por trabajador adicional).

#### Scenario: Cálculo de cuota para Plan Básico con trabajadores adicionales
- **GIVEN** un negocio seleccionando el Plan Básico (30€/mes)
- **WHEN** el usuario configura 3 trabajadores en el selector de suscripción
- **THEN** el sistema calcula 30€ (base con 1 trabajador) + 10€ (2 trabajadores extra a 5€ c/u) = 40,00 €/mes (+ IVA aplicable).

#### Scenario: Cálculo de cuota para Plan Pro con trabajadores adicionales
- **GIVEN** un negocio seleccionando el Plan Pro (40€/mes)
- **WHEN** el usuario configura 4 trabajadores en el selector de suscripción
- **THEN** el sistema calcula 40€ (base con 2 trabajadores) + 10€ (2 trabajadores extra a 5€ c/u) = 50,00 €/mes (+ IVA aplicable).

### Requirement: Restricción de Sedes y Multi-Calendario
El sistema SHALL permitir 1 única sede/calendario en el Plan Básico y sedes/calendarios ilimitados en el Plan Pro.

#### Scenario: Intento de creación de segunda sede en Plan Básico
- **GIVEN** un negocio con `subscriptionPlan = BASIC` y 1 sede existente
- **WHEN** el usuario intenta crear una nueva sede o sala adicional
- **THEN** el backend responde con código 403 y `requiresUpgrade: true`, y el frontend despliega el modal `UpgradeProModal`.

#### Scenario: Creación de múltiples sedes en Plan Pro
- **GIVEN** un negocio con `subscriptionPlan = PRO`
- **WHEN** el usuario crea una segunda o tercera sede
- **THEN** la operación se ejecuta satisfactoriamente sin restricciones.

### Requirement: Conexión y Automatización de WhatsApp Bidireccional
El sistema SHALL restringir la vinculación del bot de WhatsApp y el envío de mensajes automatizados bidireccionales exclusivamente a cuentas con Plan Pro o en periodo de Trial activo.

#### Scenario: Intento de conexión de WhatsApp en Plan Básico
- **GIVEN** un negocio con `subscriptionPlan = BASIC`
- **WHEN** el usuario accede a la sección de WhatsApp e intenta generar el código QR de vinculación
- **THEN** el sistema bloquea la acción, mostrando un aviso indicando que WhatsApp requiere el Plan Pro (40€/mes).

#### Scenario: Conexión de WhatsApp en Plan Pro
- **GIVEN** un negocio con `subscriptionPlan = PRO`
- **WHEN** el usuario inicia la vinculación de WhatsApp
- **THEN** el sistema genera el código QR y permite la automatización de confirmaciones y recordatorios.

### Requirement: Pagos Online y Cobro de Señas
El sistema SHALL reservar la configuración de cobro de señas y depósitos online a través de la página pública de reservas para los negocios con Plan Pro.

#### Scenario: Configuración de depósitos en Plan Básico
- **GIVEN** un negocio con `subscriptionPlan = BASIC`
- **WHEN** el usuario intenta habilitar el cobro obligatorio de señal para un servicio
- **THEN** el selector de pago online se muestra deshabilitado con una insignia indicando "Disponible en Plan Pro".

### Requirement: Cuota Mensual de Reservas Online en Plan Básico
El sistema SHALL limitar a un máximo de 100 reservas online mensuales las solicitudes recibidas a través de la página de reservas públicas en el Plan Básico.

#### Scenario: Superación del límite de 100 reservas online en Plan Básico
- **GIVEN** un negocio con `subscriptionPlan = BASIC` que ha acumulado 100 reservas online en el mes natural
- **WHEN** un cliente final intenta realizar la reserva 101 desde la página pública
- **THEN** el sistema notifica al negocio que ha alcanzado el límite mensual y sugiere contactar directamente o actualizar a Plan Pro para reservas ilimitadas.

### Requirement: Matriz de Permisos por Rol de Usuario
El sistema SHALL validar que los empleados (`EMPLEADO`) no puedan acceder a la gestión de suscripciones, ajustes de facturación ni modificación de otros trabajadores.

#### Scenario: Empleado intenta acceder a ajustes de facturación
- **GIVEN** un usuario autenticado con `role = EMPLEADO`
- **WHEN** navega hacia la sección de facturación o intenta ejecutar un cambio de plan
- **THEN** el sistema redirige al usuario o deniega la operación con código 403 Forbidden.
