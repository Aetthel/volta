# business-settings Specification

## Purpose

TBD - created by archiving change web-dashboard-auth. Update Purpose after archive.

## Requirements

### Requirement: Customizable Message Templates

The system SHALL allow a `BUSINESS` user to define and update their own message templates for "Welcome/Booking" and "Reminder" notifications.

#### Scenario: Business updates templates

- **WHEN** a Business user submits the settings form with new message text
- **THEN** the system updates their business configuration in the database and uses the new text for future messages

### Requirement: Template Variables

The system SHALL support dynamic variables in templates (e.g., `{{clientName}}`, `{{appointmentDate}}`) which are automatically replaced during message sending.

#### Scenario: Sending message with variables

- **WHEN** a message is sent using a template containing `{{clientName}}`
- **THEN** the system replaces the placeholder with the actual name of the client before delivery

### Requirement: Operating Hours Management

The system SHALL allow a `BUSINESS` user to update their weekly operating hours. The database transaction updating these hours MUST perform updates or upserts matching `dayOfWeek` to maintain stable primary key UUIDs for the `BusinessHours` records, avoiding delete-and-recreate operations.

#### Scenario: Updating operating hours

- **WHEN** a Business user saves their weekly operating hours schedule
- **THEN** the system updates the records using upsert operations based on dayOfWeek, preserving existing UUID keys

### Requirement: Restricción de Ajustes por Rol

El sistema SHALL restringir el acceso a las pestañas y secciones de configuración de la página de ajustes basándose en el rol del usuario actual. Los usuarios con rol `EMPLEADO` solo SHALL tener visibilidad y capacidad de modificación en la pestaña "Perfil y Seguridad". Las pestañas de "Mensajes y WhatsApp" y "Gestión del Negocio" SHALL ser visibles y editables únicamente por usuarios con rol `JEFE` o `ADMIN`.

#### Scenario: Trabajador visualiza Ajustes

- **WHEN** un usuario con rol `EMPLEADO` accede a la página de Ajustes `/ajustes`
- **THEN** el sistema no muestra los botones para cambiar a las pestañas de Mensajes y Gestión del Negocio, y visualiza únicamente el panel de Perfil y Seguridad.

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
