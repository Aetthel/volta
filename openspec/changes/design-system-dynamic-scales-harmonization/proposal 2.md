## Why

La interfaz de usuario necesita una homogeneidad estricta en tamaños tipográficos, espaciados y redondeces de bordes. Además, todos los componentes (tablas, botones, tarjetas, modales, barras de filtrado, inputs) deben responder de manera coherente, sincronizada y en tiempo real a las variables CSS dinámicas de personalización (`--font-scale` y `--radius-scale`), evitando valores fijos en píxeles que queden desalineados o no escalen con la preferencia del usuario.

## What Changes

- **Jerarquía Tipográfica Armónica y Escalable**: Estandarizar la jerarquía visual en todas las vistas (`text-headline-lg` para títulos, `text-title-md` para tarjetas, `text-sm` para cuerpo/filas, `text-xs uppercase tracking-wider` para cabeceras de tabla/metadatos y `text-xs font-bold` para badges), todas gobernadas por `--font-scale`.
- **Escala de Redondeces Dinámica Homogénea**: Unificar los niveles de radio (`rounded-2xl` para contenedores/modales/cards, `rounded-xl` para inputs/filtros/botones, `rounded-md` para badges y `rounded-full` para avatares/píldoras), todas dependientes de `--radius-scale`.
- **Eliminación de Valores Fijos**: Reemplazar valores fijos en píxeles (`rounded-[10px]`, `rounded-[14px]`, `text-[13px]`, etc.) por las clases de escala de Tailwind configuradas en `globals.css`.
- **Sincronización en Tiempo Real de Ajustes**: Asegurar que al cambiar las variables de personalización (Color, Tamaño de Texto y Redondez) en `PersonalizationSection.tsx`, las variables CSS en `:root` se actualicen al instante en toda la app y se persistan en `localStorage` y en la base de datos.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `reusable-ui-components`: Escalas dinámicas homogéneas de tipografía (`--font-scale`) y redondez (`--radius-scale`) en todos los componentes de la aplicación.

## Impact

- **CSS y Tokens**: `frontend/app/globals.css`, `frontend/lib/theme.ts`.
- **Componentes y Vistas**: `frontend/components/ui/`, `frontend/components/clients/`, `frontend/components/team/`, `frontend/components/sedes/`, `frontend/components/settings/`, `frontend/components/sidebar/`, `frontend/components/checkout/`.
- **Consistencia Visual**: Armonía 100% idéntica entre páginas y adaptación interactiva a las opciones de personalización.
