## Context

`frontend/components/settings/MessagesSection.tsx` contenía 713 líneas mezclando la lógica de socket/polling de QR con la renderización de burbujas de WhatsApp y parsing de etiquetas.

## Goals / Non-Goals

**Goals:**
- Crear `WhatsAppConnectionCard.tsx` y `WhatsAppTemplatesEditor.tsx` en `frontend/components/settings/messages/`.
- Mantener intacto el sistema de variables dinámicas e inserción en el cursor del textarea.

**Non-Goals:**
- No modificar endpoints backend de WhatsApp.

## Decisions

1. **Submódulos en `frontend/components/settings/messages/`**:
   - `WhatsAppConnectionCard.tsx` (Estado + QR + Desconexión).
   - `WhatsAppTemplatesEditor.tsx` (Tabs + Inserción de variables + Preview).

## Risks / Trade-offs

- Ninguno. 100% retrocompatible.
