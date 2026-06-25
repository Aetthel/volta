## Context

Corrección del contraste de texto del botón primario que se muestra de color oscuro.

## Goals / Non-Goals

**Goals:**
- Asegurar que el texto del botón principal sea blanco (`#ffffff`) utilizando el token semántico de contraste `text-on-primary`.

## Decisions

- **Uso de text-on-primary:** Reemplazar `text-white` y `hover:text-white` en la variante `primary` del botón de `volta-ui.tsx` con `text-on-primary` y `hover:text-on-primary`. El color `on-primary` está definido en el tema de globals.css como `#ffffff` (blanco), garantizando consistencia y legibilidad.
