## Why

La página principal del panel de control (`app/(dashboard)/agenda/page.tsx`) carga de forma estática y síncrona múltiples modales pesados (`NewAppointmentModal`, `AddClientModal`, `AddServiceModal`, `UpgradeProModal`), lo que incrementa innecesariamente el tamaño del bundle inicial descargado por el usuario. Además, faltan componentes de captura de errores (`error.tsx`) y estados de carga progresiva (`loading.tsx`) en rutas secundarias.

Optimizar la carga con `next/dynamic` y estructurar Error Boundaries mejorará drásticamente la velocidad de carga inicial (First Load JS / LCP) y la resistencia frente a fallos de red en la UI.

## What Changes

- **Carga Diferida de Modales (*Lazy Loading*)**: Convertir la importación de modales de la Agenda a `next/dynamic` con `{ ssr: false }`.
- **Estados de Carga Progresiva**: Añadir `loading.tsx` con skeletons en las subrutas principales del Dashboard.
- **Manejo de Errores en UI**: Crear `error.tsx` con botón de reintento para rutas clave del Dashboard.

## Capabilities

### New Capabilities
- `frontend-performance`: Optimización de bundle JS, división de código (*code splitting*) y resiliencia visual en Next.js App Router.

### Modified Capabilities
<!-- No requirement changes -->

## Impact

- **Código Afectado**: `frontend/app/(dashboard)/agenda/page.tsx`, `frontend/app/(dashboard)/layout.tsx` y nuevas vistas de fallback.
- **Rendimiento**: Reducción estimada del 30-40% en el First Load JS Bundle de la página de agenda.
- **UX**: Retroalimentación instantánea con Skeletons durante la navegación.
