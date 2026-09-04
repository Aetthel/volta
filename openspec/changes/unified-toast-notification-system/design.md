## Context

Ver `proposal.md` y `specs/reusable-ui-components/spec.md` para la motivación y requisitos funcionales.
Actualmente existen 5 implementaciones divergentes de notificaciones en el cliente web, sin apilamiento, con temporizadores descoordinados, conflictos en móvil (`bottom-6` sobre el `BottomNav` y el FAB), e inconsistencias visuales y semánticas.

## Goals / Non-Goals

**Goals:**
- Implementar un único proveedor central de notificaciones basado en `sonner` adaptado a los tokens de Volta UI (`bg-surface-container-lowest`, `border-outline-variant`, radios dinámicos, sombras sutiles).
- Ofrecer una API declarativa global y accesible (`toast.success`, `toast.error`, `toast.warning`, `toast.info`, `toast.whatsapp`).
- Garantizar posicionamiento adaptativo: `top-right` en desktop y `top-center` en móvil para evitar colisiones con el menú inferior y el FAB.
- Eliminar todo el prop drilling de `setToast` en la vista de Ajustes y submódulos.
- Reemplazar todas las alertas flotantes ad-hoc y llamadas bloqueantes `window.alert()` en Agenda, Clientes, Equipo e Inicio.

**Non-Goals:**
- Modificar el sistema de notificaciones persistentes de base de datos/buzón de entrada (gestionado en `lib/alerts.tsx` y `/inbox`). Este diseño aborda exclusivamente los avisos transitorios interactivos en pantalla (*toasts/snackbars*).

## Decisions

### 1. Elección de librería: `sonner` encapsulado en Volta UI
- **Decisión**: Añadir `sonner` como dependencia de frontend y envolverlo en `frontend/components/ui/sonner.tsx`.
- **Razón**: Es la librería más rápida, accesible (~3kb), con soporte táctil (swipe para descartar), gestión de colas/stacking automático y personalización total mediante clases Tailwind.
- **Alternativa descartada**: Implementar un sistema de toasts casero desde cero con `useState` y `createPortal`, lo cual añade código redundante y complejidad de accesibilidad (`aria-live`, control de foco, gestos táctiles).

### 2. Posicionamiento Responsivo
- **Decisión**: Configurar `<Toaster position="top-right" />` con estilos responsivos para móvil que lo centren (`top-center`) o ajusten sus márgenes automáticamente en viewports estrechos.
- **Razón**: La zona superior derecha es el estándar natural en aplicaciones web de gestión. En móvil, ubicarse en la parte superior evita cualquier interacción o solapamiento con el `BottomNav` (altura 64px fija) y el botón flotante FAB (`bottom-20`).

### 3. Integración con el Sistema de Diseño Volta
- **Decisión**: Configurar las clases del `toast` en `sonner.tsx` para consumir directamente las variables y clases de Volta:
  - Fondo: `bg-surface-container-lowest`
  - Texto principal: `text-on-surface`
  - Texto secundario: `text-on-surface-variant`
  - Borde: `border-outline-variant/60`
  - Esquinas redondeadas: `rounded-xl`
  - Iconos de Lucide: `CheckCircle2` (verde éxito), `AlertCircle` (rojo error), `AlertTriangle` (amarillo advertencia), `Info` (azul/teal info), y `MessageCircle`/`Phone` (WhatsApp).

### 4. Helper especializado `toast.whatsapp`
- **Decisión**: Crear una función utilitaria `toast.whatsapp({ phone, message, title })` que renderice un toast enriquecido con el icono de WhatsApp, el teléfono destacado y el mensaje del consentimiento LOPD.
- **Razón**: Estandariza los avisos que actualmente se disparaban en `NewAppointmentModal` y `clientes/page.tsx` de forma dispar.

### 5. Montaje global y eliminación de prop drilling
- **Decisión**: Montar `<Toaster />` una sola vez en `frontend/components/Providers.tsx`.
- **Razón**: Al ser global, cualquier componente puede importar `{ toast } from "@/components/ui/volta-ui"` y disparar notificaciones sin necesidad de recibir funciones por props ni gestionar estados `showToast`/`setShowToast`.

## Risks / Trade-offs

- **[Riesgo] Sincronización de temas (Claro / Oscuro)**:
  - *Mitigación*: Pasar la propiedad `theme` a `<Toaster />` conectada con el contexto de tema (`useTheme`) o dejar que herede la clase `.dark` del elemento `<html>`.
- **[Riesgo] Tests existentes de componentes**:
  - *Mitigación*: Los tests que comprobaban `setToast` como mock (ej. `BusinessScheduleCard.test.tsx`) pueden seguir pasando o simplificarse. Los tests de integración podrán verificar la llamada a `toast` mockeando `@/components/ui/volta-ui`.

## Migration Plan

1. **Instalación y Componente Base**:
   - Instalar `sonner` en `frontend`.
   - Crear `frontend/components/ui/sonner.tsx` con el componente `<Toaster />` y la extensión `toast.whatsapp`.
   - Re-exportar `Toaster` y `toast` desde `frontend/components/ui/volta-ui.tsx`.
   - Montar `<Toaster />` en `frontend/components/Providers.tsx`.
2. **Migración por Pantallas**:
   - **Agenda** (`agenda/page.tsx`): Sustituir toast local y timeouts por `toast.success` / `toast.error`.
   - **Equipo** (`equipo/page.tsx`, `useTeamList.ts`): Sustituir `<Alert>` y `window.alert` por `toast`.
   - **Clientes** (`clientes/page.tsx`, `useClientsList.ts`): Sustituir los dos `<Alert>` flotantes por `toast.whatsapp` y `toast.success`.
   - **Modales de Cita y Cliente** (`NewAppointmentModal.tsx`, `inicio/page.tsx`): Integrar `toast.whatsapp` y feedback visual en inicio.
   - **Ajustes** (`ajustes/page.tsx` y submódulos): Eliminar prop drilling de `setToast`, migrar llamadas a `toast.*`, y borrar `components/settings/Toast.tsx`.
3. **Verificación**:
   - Ejecutar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
