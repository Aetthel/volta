## Why

Actualmente, las notificaciones y mensajes de feedback ("toasts") en Volta presentan graves incoherencias espaciales, visuales y arquitecturales. Existen páginas que notifican abajo a la derecha (`bottom-6 right-6` en Agenda y Equipo), otras arriba a la derecha (`top-6 right-6` en Clientes y Ajustes), y otras que no muestran feedback alguno (Inicio al crear citas). En dispositivos móviles, las notificaciones inferiores colisionan frontalmente con la barra de navegación (`BottomNav`) y el botón flotante (FAB).

A nivel visual y funcional, los avisos carecen de consistencia: se mezclan componentes `<Alert>`, divs con fondos de color plano, iconos erróneos (en Ajustes los mensajes de error muestran un `CheckCircle` verde de éxito), solapamiento pixel a pixel sin apilamiento cuando coinciden dos avisos, timeouts desincronizados (`setTimeout` sin control) y prop drilling masivo de `setToast` a través de decenas de componentes. Esta propuesta introduce un sistema unificado y accesible de notificaciones toast basado en `sonner` adaptado 100% a los tokens y estética de Volta UI, eliminando todas las implementaciones fragmentadas.

## What Changes

- **Integración de `sonner` tematizado con Volta UI**: Instalación de `sonner` e implementación del componente central `<Toaster />` y del módulo de utilidades `toast` en `frontend/components/ui/sonner.tsx` y re-exportado en `frontend/components/ui/volta-ui.tsx`.
- **Montaje global único en el Layout**: Inserción del `<Toaster />` en `frontend/components/Providers.tsx`, asegurando disponibilidad global en cualquier página, modal o componente sin prop drilling.
- **Estandarización espacial y responsiva**:
  - En **escritorio (desktop)**: Notificaciones fijadas consistentemente arriba a la derecha (`top-right`), con margen ergonómico y apilamiento (stacking) suave de hasta 3 tarjetas.
  - En **móviles (mobile)**: Notificaciones fijadas arriba centradas (`top-center`), evitando totalmente cualquier colisión o solapamiento con el `BottomNav` inferior y el botón flotante FAB.
- **Variantes semánticas y especializadas con tokens Volta UI**:
  - `toast.success(message, options)`: Contenedor con borde y acentos de éxito, icono semántico `CheckCircle2`.
  - `toast.error(message, options)`: Contenedor con borde y acentos de error (`bg-error/10`, `text-error`), icono `AlertCircle`.
  - `toast.warning(message, options)`: Contenedor con acentos de advertencia, icono `AlertTriangle`.
  - `toast.info(message, options)`: Contenedor informativo, icono `Info`.
  - `toast.whatsapp({ phone, message })`: Variante personalizada para confirmaciones de WhatsApp y LOPD con icono dedicado y formateo de número.
- **Eliminación y refactorización de implementaciones ad-hoc**:
  - **Agenda** (`agenda/page.tsx`): Reemplazo del toast inferior ad-hoc (`bg-emerald-500` / `bg-error`) por llamadas directas a `toast.success` y `toast.error`.
  - **Equipo** (`equipo/page.tsx` y `useTeamList.ts`): Eliminación del toast inferior ad-hoc con `<Alert>` y eliminación de los `window.alert()` nativos bloqueantes.
  - **Clientes** (`clientes/page.tsx` y `useClientsList.ts`): Eliminación de los `<Alert>` flotantes en `top-6 right-6` que se solapaban pixel a pixel, y reemplazo por `toast.success`, `toast.error` y `toast.whatsapp`. Eliminación de `alert(...)` nativo en el borrado.
  - **Ajustes** (`ajustes/page.tsx`, `settings/Toast.tsx` y submódulos): Eliminación completa del componente obsoleto `Toast.tsx` y del prop drilling de `setToast` a lo largo de `BusinessSection`, `ProfileSection`, `MessagesSection`, `BillingSection`, `BusinessHoursGrid`, `BusinessHolidaysGrid`, etc.
  - **Modal de Nueva Cita** (`NewAppointmentModal.tsx`): Reemplazo del `<Alert>` de consentimiento flotante por `toast.whatsapp`.
  - **Inicio** (`inicio/page.tsx`): Adición de feedback toast visual al guardar citas o clientes desde el panel de inicio.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de dominio; se amplía el catálogo de componentes reutilizables existente. -->

### Modified Capabilities
- `reusable-ui-components`: Se añade el requisito del sistema unificado de notificaciones toast (`Toaster`, `toast.*`), con soporte para apilamiento, variantes semánticas con tokens de diseño, posicionamiento responsivo seguro sin colisiones móviles, y eliminación de los toasts ad-hoc.

## Impact

- **Dependencias**: Se añade `sonner` en `frontend/package.json`.
- **Archivos creados**:
  - `frontend/components/ui/sonner.tsx` (Componente Toaster adaptado a temas claro/oscuro y tokens Volta).
- **Archivos modificados**:
  - `frontend/components/Providers.tsx`: Incorporación de `<Toaster />`.
  - `frontend/components/ui/volta-ui.tsx`: Exportación de `toast` y `Toaster`.
  - `frontend/app/(dashboard)/agenda/page.tsx`: Migración a `toast`.
  - `frontend/app/(dashboard)/equipo/page.tsx`: Migración a `toast`.
  - `frontend/app/(dashboard)/clientes/page.tsx`: Migración a `toast`.
  - `frontend/app/(dashboard)/inicio/page.tsx`: Añadido feedback de guardado con `toast`.
  - `frontend/app/(dashboard)/ajustes/page.tsx` y componentes de `frontend/components/settings/**`: Limpieza de `setToast` y migración a `toast`.
  - `frontend/components/NewAppointmentModal.tsx`: Migración a `toast`.
  - `frontend/lib/hooks/useClientsList.ts` y `frontend/lib/hooks/useTeamList.ts`: Eliminación de estados locales de toast y `alert()` nativos.
- **Archivos eliminados o deprecados**:
  - `frontend/components/settings/Toast.tsx` (eliminado al quedar obsoleto).
