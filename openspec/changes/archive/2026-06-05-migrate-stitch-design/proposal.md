## Why

El objetivo de este cambio es migrar, estandarizar y estructurar en componentes de React reutilizables el diseño de pantallas exportado de Stitch para la aplicación Glow Studio (Volta). Esto permite resolver la inconsistencia visual de las plantillas HTML originales y centralizar el diseño bajo las directrices del sistema de diseño "Clinical Elegance" y Tailwind CSS puro.

## What Changes

- **Estandarización de Tokens**: Centralización de colores (Teal, grays), tipografía (Inter con escala base de 18px "Zoomed-In") y bordes redondeados en `frontend/app/globals.css` usando Tailwind CSS v4.
- **Componentes de Layout Compartidos**:
  - `Sidebar`: Barra lateral para pantallas de escritorio.
  - `BottomNav`: Navegación inferior ergonómica para pantallas móviles.
  - `Header`: Barra superior para búsqueda y perfil.
- **Componentes Funcionales Reutilizables**:
  - `MetricCard`: Tarjetas de estadísticas unificadas.
  - `AddClientModal` y `NewAppointmentModal`: Modales interactivos compartidos.
- **Rutas e Interfaces del Frontend**:
  - `/login` (Inicio de Sesión)
  - `/dashboard` (Calendario de citas y agenda semanal)
  - `/clientes` (Administración de la base de datos de usuarios)
  - `/sedes` (Gestión de sucursales)
  - `/ajustes` (Horarios y perfil comercial)
  - `/admin` (Panel de control con analíticas y rankings globales)

## Capabilities

### New Capabilities

- `stitch-design-migration`: Migración del diseño visual estático a páginas reactivas en Next.js.
- `reusable-ui-components`: Extracción y desarrollo de componentes de interfaz reutilizables e interactivos (Sidebar, BottomNav, Header, MetricCard, Modales).

### Modified Capabilities

_(Ninguna especificación funcional existente ha sido modificada, ya que la lógica del backend y base de datos se mantiene intacta)_

## Impact

- **Frontend Next.js**:
  - Configuración global en [globals.css](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/globals.css) y [layout.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/layout.tsx).
  - Nuevos componentes en `frontend/components/` ([Sidebar.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Sidebar.tsx), [BottomNav.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/BottomNav.tsx), [Header.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Header.tsx), [MetricCard.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/MetricCard.tsx), [AddClientModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/AddClientModal.tsx), [NewAppointmentModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/NewAppointmentModal.tsx)).
  - Nuevas rutas en `frontend/app/` (`/login`, `/dashboard`, `/clientes`, `/sedes`, `/ajustes`, `/admin`).
