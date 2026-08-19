## Context

Optimización de la carga inicial de componentes React en el Next.js App Router mediante división de código (*code splitting*) y manejo de fallback en suspensión.

## Goals / Non-Goals

**Goals:**
- Implementar `next/dynamic` en la página de agenda.
- Crear `loading.tsx` y `error.tsx` en el dashboard.

**Non-Goals:**
- Cambiar la paleta visual o diseño de componentes UI.

## Decisions

### Decision 1: Dynamic Imports con ssr: false para Modales
- **Opción Elegida**: Cargar modales interactivos con `dynamic(() => import(...), { ssr: false })`.
- **Razón**: Los modales dependen de APIs de navegador y no requieren Server-Side Rendering (SSR).
