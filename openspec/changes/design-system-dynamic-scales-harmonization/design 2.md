## Context

El usuario requiere que todos los tamaños de texto, jerarquías visuales y radios de borde sean completamente homogéneos en todas las pantallas de Volta y que respondan dinámicamente a las preferencias del usuario configuradas en la sección de Personalización (`--font-scale` y `--radius-scale`).

## Goals / Non-Goals

**Goals:**
- Asegurar que `globals.css` defina todas las variables de tipografía (`--text-xs`, `--text-sm`, `--text-base`, `--text-headline-lg`, etc.) y de bordes (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, etc.) multiplicadas por `--font-scale` y `--radius-scale`.
- Auditar y armonizar componentes en `frontend/components/` para eliminar valores fijos que eviten la escala dinámica.
- Garantizar que el cambio de personalización en `PersonalizationSection.tsx` y la carga inicial en `layout.tsx` / `ClientLayout` aplique `--font-scale`, `--radius-scale` y `--color-*` inmediatamente a nivel del documento raíz.

**Non-Goals:**
- No alterar las funcionalidades de negocio ni endpoints.

## Decisions

1. **Tokens en `globals.css`**:
   - `globals.css` en `@theme` ya define multiplicadores `calc(... * var(--font-scale))` y `calc(... * var(--radius-scale))`.
   - Asegurar que `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, etc., usen `rounded-xl`, `rounded-2xl`, `rounded-md` y las clases de texto `text-sm`, `text-xs`, `text-lg`, etc.

2. **Carga y Sincronización Global**:
   - Asegurar que al cargar la aplicación (en `frontend/app/layout.tsx` o provider de tema), se lean las variables de `localStorage` o de sesión y se inyecten en `:root` antes del renderizado para evitar parpadeos visuales (FOUC).

## Risks / Trade-offs

- Ninguno.
