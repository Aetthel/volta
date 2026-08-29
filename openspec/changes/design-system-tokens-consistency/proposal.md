## Why

Para ofrecer una experiencia de usuario consistente, profesional y accesible, todos los elementos de la interfaz deben adherirse a los tokens de diseño unificados de Volta UI: paletas de color semánticas (`primary`, `surface-container`, `on-surface`), escalas dinámicas de redondez (`--radius-scale`), micro-interacciones táctiles homogéneas (`active:scale-[0.98]`) y soporte completo de temas claro/oscuro sin colores duros (hardcoded hex).

## What Changes

- **Tokens Semánticos de Superficie y Color**: Reemplazar clases de colores genéricos o arbitrarios por tokens semánticos de Volta (`bg-surface`, `bg-surface-container-low`, `text-on-surface-variant`, `border-outline-variant`).
- **Unificación de Micro-Interacciones en Botones e Inputs**: Garantizar que todos los componentes interactivos utilicen el componente `<Button>` estandarizado con respuesta táctil y feedback visual de carga.
- **Respeto a la Escala de Redondez Dinámica**: Enlazar las clases de bordes a las variables de radio (`rounded-xl`, `rounded-2xl`, `rounded-full` según la configuración de personalización de marca).
- **Consistencia en Modo Oscuro**: Asegurar que todas las tarjetas, modales y tablas mantengan alto contraste y legibilidad tanto en tema claro como oscuro.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `reusable-ui-components`: Homogeneización de tokens semánticos, compatibilidad de radio dinámico y consistencia interactiva en todos los componentes UI.

## Impact

- **Frontend UI**: `frontend/components/ui/`, `frontend/components/calendar/`, `frontend/components/settings/`, `frontend/app/(dashboard)/`.
- **Experiencia de Usuario**: Consistencia visual 100% pulida y profesional.
