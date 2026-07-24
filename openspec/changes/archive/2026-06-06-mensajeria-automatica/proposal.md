## Why

Actualmente, el sistema de mensajería automática y recordatorios no está integrado con el consentimiento LOPD del cliente ni dispone de una interfaz para configurar las plantillas de mensajes o conectar el canal de WhatsApp mediante código QR. Este cambio implementará el flujo completo para automatizar la solicitud de consentimiento (LOPD), el emparejamiento de WhatsApp Web y la personalización de mensajes de confirmación y recordatorio.

## What Changes

- **Control de Consentimiento LOPD**:
  - Al registrarse un cliente nuevo a través de una cita, su estado se inicializará en `Pendiente`.
  - Se enviará un mensaje de WhatsApp automatizado solicitando consentimiento con un enlace público (`/lopd/[id_cliente]`).
  - Se bloquearán los mensajes automáticos (bienvenida y recordatorios del Sentinel) hasta que el estado del cliente sea `Aceptado`.
  - Se creará una página pública y responsiva en `/lopd/[id]` para que el cliente lea y acepte la política de privacidad.
  - Al aceptar, se actualizará el estado a `Aceptado` en el backend y se enviará de forma retroactiva el mensaje de confirmación de cita pendiente.
- **Gestión de Conexión de WhatsApp**:
  - Endpoints en el backend para iniciar la sesión (`POST /api/whatsapp/init`), consultar estado y QR (`GET /api/whatsapp/status`) y desconectar (`POST /api/whatsapp/disconnect`).
  - Interfaz de usuario en la pantalla de Ajustes para emparejar la cuenta mediante código QR y ver el estado de conexión en tiempo real.
- **Personalización de Plantillas**:
  - Endpoints para obtener y guardar plantillas (`welcomeMessage` y `reminderMessage`).
  - Campos de entrada interactivos en Ajustes para editar las plantillas con variables dinámicas (`{{clientName}}`, `{{appointmentDate}}`, `{{appointmentTime}}`, `{{businessName}}`).

## Capabilities

### New Capabilities

- `whatsapp-gateway-management`: Control del ciclo de vida del cliente de WhatsApp (inicialización, desconexión y lectura del estado/QR de emparejamiento).
- `automated-messaging-templates`: Administración y edición de plantillas de confirmación de reserva y recordatorios diarios de cita.
- `lopd-consent-workflow`: Flujo de consentimiento LOPD (envío automatizado del enlace de aceptación, página pública del cliente y desbloqueo de notificaciones retenidas al firmar).

### Modified Capabilities

_(Ninguna)_

## Impact

- **Backend**:
  - [index.js](file:///Users/kore/Documents/Code/Projects/volta/backend/src/index.js): Añadir endpoints para `/api/whatsapp/*` y `/api/lopd/*`. Modificar la creación de citas para disparar el flujo de LOPD o bienvenida de forma selectiva.
  - [bot.js](file:///Users/kore/Documents/Code/Projects/volta/backend/src/bot.js): Actualizar `sendWelcomeMessage` y `runSentinel` para validar que el estado LOPD sea `Aceptado`.
- **Frontend**:
  - [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx): Integrar el panel de WhatsApp y el editor de plantillas.
  - `frontend/app/lopd/[id]/page.tsx`: Nueva ruta pública para el consentimiento del cliente.
