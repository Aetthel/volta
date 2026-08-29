## ADDED Requirements

### Requirement: Garantía de Entrega de Alertas en Webhooks
El webhook de WhatsApp SHALL garantizar la persistencia de alertas para todos los mensajes entrantes válidos, resolviendo el usuario destinatario a través de la cita activa o, en su defecto, a través del usuario principal del negocio (`businessId`).

#### Scenario: Mensaje recibido sin cita previa
- **WHEN** un cliente envía un mensaje a la instancia de WhatsApp del negocio sin tener una cita registrada en la base de datos
- **THEN** el sistema recupera el usuario administrador del negocio y crea la alerta en su bandeja de entrada
