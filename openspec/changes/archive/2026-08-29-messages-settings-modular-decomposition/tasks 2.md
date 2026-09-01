## 1. Creación de Submódulos de Mensajería

- [x] 1.1 Crear `frontend/components/settings/messages/WhatsAppConnectionCard.tsx` (estado, QR, reconexión)
- [x] 1.2 Crear `frontend/components/settings/messages/WhatsAppTemplatesEditor.tsx` (editor, inserción de etiquetas, preview móvil)

## 2. Refactorización del Orquestador `MessagesSection.tsx`

- [x] 2.1 Refactorizar `frontend/components/settings/MessagesSection.tsx` como orquestador limpio (< 60 líneas)

## 3. Verificación y Validación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar OpenSpec con `openspec validate`
