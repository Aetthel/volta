## ADDED Requirements

### Requirement: Modularización de Pasarela y Plantillas de Mensajes
La sección de configuración de mensajes SHALL estructurar la gestión de conexión con la API de WhatsApp y el editor de plantillas en componentes desacoplados dentro de `frontend/components/settings/messages/`.

#### Scenario: Vinculación de WhatsApp y edición de plantillas
- **WHEN** un usuario vincula su instancia escaneando el código QR o edita el texto de recordatorio de citas
- **THEN** la tarjeta de conexión gestiona el sondeo de estado independientemente del editor de plantillas, manteniendo reactividad fluida
