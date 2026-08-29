# automated-messaging-templates Specification

## Purpose

TBD - created by archiving change mensajeria-automatica. Update Purpose after archive.

## Requirements

### Requirement: Retrieve Message Templates

The backend SHALL expose an endpoint to retrieve the current welcome and reminder message templates configured for a business.

#### Scenario: Fetching templates from database

- **WHEN** frontend calls `/api/whatsapp/templates` with `businessId`
- **THEN** the backend returns the `welcomeMessage` and `reminderMessage` values

### Requirement: Update Message Templates

The backend SHALL expose an endpoint to save changes to the welcome and reminder message templates.

#### Scenario: Updating template texts

- **WHEN** frontend posts to `/api/whatsapp/templates` with `businessId`, `welcomeMessage`, and `reminderMessage`
- **THEN** the backend updates the business record in the database with the new template texts

### Requirement: Modularización de Pasarela y Plantillas de Mensajes
La sección de configuración de mensajes SHALL estructurar la gestión de conexión con la API de WhatsApp y el editor de plantillas en componentes desacoplados dentro de `frontend/components/settings/messages/`.

#### Scenario: Vinculación de WhatsApp y edición de plantillas
- **WHEN** un usuario vincula su instancia escaneando el código QR o edita el texto de recordatorio de citas
- **THEN** la tarjeta de conexión gestiona el sondeo de estado independientemente del editor de plantillas, manteniendo reactividad fluida
