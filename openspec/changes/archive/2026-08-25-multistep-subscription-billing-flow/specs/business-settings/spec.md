## ADDED Requirements

### Requirement: Pestaña de Facturación y Suscripción en Ajustes
El sistema SHALL proporcionar una pestaña dedicada "Facturación y Suscripción" dentro de la página de Ajustes (`/ajustes`) accesible para usuarios con rol `JEFE` o `ADMIN`.

#### Scenario: Visualización del estado de suscripción y plan activo
- **WHEN** un usuario con rol `JEFE` o `ADMIN` accede a la pestaña "Facturación y Suscripción"
- **THEN** el sistema muestra la tarjeta del plan actual (Básico, Pro o Trial), fecha de próximo cobro/expiración, botón para "Cambiar / Mejorar Plan", botón de "Gestionar / Cancelar en Portal" y botón de cancelación directa.

#### Scenario: Cancelación de la suscripción
- **WHEN** el usuario confirma la cancelación de su suscripción desde Ajustes
- **THEN** el sistema programa la baja al finalizar el ciclo de facturación actual en Lemon Squeezy, manteniendo el acceso hasta la fecha de expiración pagada.

#### Scenario: Listado de facturas emitidas por Lemon Squeezy
- **WHEN** la pestaña de facturación es cargada
- **THEN** el sistema lista las facturas emitidas indicando fecha, concepto, importe total pagado, estado y enlace de descarga directa al PDF oficial del Merchant of Record.
