## Why

`frontend/components/settings/MessagesSection.tsx` concentra 713 líneas mezclando la conexión de la instancia de WhatsApp (código QR, polling de conexión y desconexión) con el editor de plantillas de mensajes (inserción de etiquetas dinámicas y vista previa en vivo de burbuja de chat). Descomponer este módulo en submódulos especializados mejorará la legibilidad y facilitará la reutilización.

## What Changes

- **Descomposición en Submódulos bajo `frontend/components/settings/messages/`**:
  - `WhatsAppConnectionCard.tsx`: Estado de la pasarela, generación de QR para vinculación, polling asíncrono y acciones de reconexión/desconexión.
  - `WhatsAppTemplatesEditor.tsx`: Editor de plantillas de bienvenida y recordatorio, panel de variables dinámicas (`{nombre}`, `{fecha}`, etc.) y preview simulado de WhatsApp.
- **Orquestación Limpia**: Reducir `MessagesSection.tsx` a un orquestador conciso (< 60 líneas).

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `automated-messaging-templates`: Modularización del gestor de pasarela y plantillas de WhatsApp.

## Impact

- **Frontend**: `frontend/components/settings/MessagesSection.tsx`, `frontend/components/settings/messages/`.
- **Mantenibilidad**: Reducción de 713 líneas a componentes de alta cohesión.
