## Why

Actualmente, las cabeceras de título y descripción de las páginas principales de Volta se definen de forma ad-hoc en cada archivo (`clientes/page.tsx`, `sedes/page.tsx`, `ajustes/page.tsx`, `admin/page.tsx`, `inicio/page.tsx`). Esto resulta en inconsistencias visuales de alineación, tipografía, padding y espaciados entre sí. Para mantener la coherencia con el diseño "Clinical Elegance" y facilitar el mantenimiento, es necesario estandarizar estas cabeceras en un componente reutilizable llamado `PageHeader` que admita títulos, descripciones y acciones opcionales de manera unificada.

## What Changes

- **Componente Reutilizable**: Crear el componente `PageHeader` en [volta-ui.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/ui/volta-ui.tsx) con soporte para `title`, `description` (opcional) y `actions` (opcional, ej. botones o selectores).
- **Consistencia en Vistas**:
  - **Clientes (`/clientes`)**: Usar `PageHeader` con el título "Gestión de Clientes", descripción y los botones "Exportar" y "Añadir Cliente" como acciones.
  - **Sedes (`/sedes`)**: Usar `PageHeader` con el título "Gestión de Locales", descripción y el botón "Añadir Local".
  - **Ajustes (`/ajustes`)**: Usar `PageHeader` para ambas vistas ("Configuración" y "Ajustes de Administrador") sin botones/acciones.
  - **Inicio (`/inicio`)**: Reemplazar la tarjeta de bienvenida con bordes y fondo actual por el componente `PageHeader` limpio (sin botones), mostrando el saludo personalizado y el recuento de citas como descripción, alineándose con el estilo sin tarjeta del resto de las páginas.
  - **Agenda (`/agenda`)**: No utilizar header, ya que la vista del calendario comienza directamente en la cuadrícula, según lo solicitado.
  - **Admin (`/admin`)**: Usar `PageHeader` con el selector de rango de fechas como `actions`.

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `reusable-ui-components`: Añadir el componente `PageHeader` a la librería de componentes reutilizables Volta UI.
- `stitch-design-migration`: Estandarizar la relación geométrica y estilo visual de las cabeceras de página en todas las vistas principales.

## Impact

- **Librería de componentes**: `frontend/components/ui/volta-ui.tsx`
- **Páginas del frontend**:
  - `frontend/app/inicio/page.tsx`
  - `frontend/app/clientes/page.tsx`
  - `frontend/app/sedes/page.tsx`
  - `frontend/app/ajustes/page.tsx`
  - `frontend/app/admin/page.tsx`
