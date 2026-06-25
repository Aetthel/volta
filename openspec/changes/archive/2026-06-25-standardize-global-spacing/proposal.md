## Why

Actualmente, las distintas vistas de Volta (/inicio, /agenda, /clientes, /ajustes, /admin, /sedes) presentan inconsistencias en sus espaciados (márgenes y gaps). Se utilizan combinaciones rígidas de clases de Tailwind (`gap-4`, `gap-6`, `mb-6`, `p-6`) que no se adaptan de forma óptima a pantallas móviles y tablets. Para lograr la estética "Clinical Elegance", es necesario estandarizar el espaciado global mediante un token de espaciado fluido reescalable que unifique la rejilla visual en cualquier resolución.

## What Changes

- **Definición de Espaciado Fluido**: Modificar la variable `--spacing-gutter` en `globals.css` para utilizar una escala fluida usando la función CSS `clamp(1rem, 0.75rem + 1.25vw, 1.5rem)`.
- **Estandarización de Layouts**: Sustituir todas las clases de padding, márgenes y gaps estáticos de las vistas principales (`/inicio`, `/agenda`, `/clientes`, `/ajustes`, `/admin`, `/sedes`) por el uso unificado del token `gutter` (`p-gutter`, `gap-gutter`, `mb-gutter`, etc.).
- **Unificación de Componentes**: Adaptar componentes comunes si es necesario para asegurar la alineación geométrica del contenido dentro de cada página.

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `reusable-ui-components`: Unificar el comportamiento y tokens de espaciado en la librería de componentes Volta UI.
- `stitch-design-migration`: Estandarizar la relación geométrica de los layouts globales.

## Impact

- **Estilos globales**: `frontend/app/globals.css`
- **Páginas del dashboard y vistas**:
  - `frontend/app/inicio/page.tsx`
  - `frontend/app/agenda/page.tsx`
  - `frontend/app/clientes/page.tsx`
  - `frontend/app/sedes/page.tsx`
  - `frontend/app/ajustes/page.tsx`
  - `frontend/app/admin/page.tsx`
- **Librería Volta UI**: `frontend/components/ui/volta-ui.tsx`
