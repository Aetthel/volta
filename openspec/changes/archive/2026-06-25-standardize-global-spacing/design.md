## Context

Actualmente, las distintas vistas de Volta presentan inconsistencias visuales en el espaciado (márgenes y gaps). Se utilizan valores estáticos como `gap-4`, `gap-6` o `p-6` que no se adaptan correctamente a resoluciones de dispositivos móviles y tablets. Para resolver esto y mantener la coherencia con el diseño "Clinical Elegance", se acordó estandarizar el espaciado global utilizando una estrategia de espaciado fluido (Opción A).

## Goals / Non-Goals

**Goals:**

- Centralizar la variable de espaciado `--spacing-gutter` en [globals.css](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/globals.css) usando `clamp()` de CSS.
- Estandarizar las vistas `/inicio`, `/agenda`, `/clientes`, `/ajustes`, `/admin` y `/sedes` para que utilicen clases de utilidad basadas en `gutter` (`p-gutter`, `gap-gutter`, `mb-gutter`, etc.) en lugar de clases estáticas de Tailwind CSS.
- Asegurar que la separación visual (tanto en el eje X como en el eje Y) sea reescalable y fluida en todas las pantallas.

**Non-Goals:**

- Cambiar la lógica de negocio o comportamiento funcional de las páginas.
- Rediseñar los componentes visuales internos (como botones o inputs) más allá de sus espaciados y alineaciones externas.

## Decisions

### 1. Espaciado fluido con CSS `clamp()`

Decidimos usar un valor dinámico para la variable `--spacing-gutter` en lugar de media queries discretas:

```css
--spacing-gutter: clamp(1rem, 0.75rem + 1.25vw, 1.5rem);
```

- **Razón:** Esto asegura una transición visual suave entre móviles (donde `gutter` se calcula en `16px`), tablets (calculado en aprox. `20px`) y pantallas de escritorio grandes (donde se limita a un máximo de `24px`). Evita los saltos bruscos de diseño al redimensionar la ventana.
- **Alternativas consideradas:** Breakpoints fijos con media queries (Opción B). Aunque ofrece control exacto píxel por píxel, genera código CSS más verboso y saltos visuales perceptibles.

### 2. Conversión a Clases Basadas en `gutter`

Sustituiremos los márgenes y gaps fijos por las correspondientes variables de Tailwind CSS v4 configuradas con `--spacing-gutter`:

- `gap-4`, `gap-6` -> `gap-gutter`
- `mb-6`, `mb-8` -> `mb-gutter`
- `p-4`, `p-6` (en layouts) -> `p-gutter`
- **Razón:** Permite que cualquier cambio futuro en la densidad del espaciado general de la aplicación se pueda realizar modificando únicamente una línea de código en [globals.css](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/globals.css).

## Risks / Trade-offs

- **[Riesgo]** Densidad excesiva en pantallas muy pequeñas (ej. teléfonos inteligentes antiguos): Un gutter de `16px` (`1rem`) podría ser demasiado grande en pantallas de menos de `360px` de ancho.
  - _Mitigación:_ La función `clamp()` establece el mínimo estricto en `1rem` (`18px` según el tamaño de fuente base actual). Dado que el tamaño de fuente base es `18px`, `1rem` = `18px`. En pantallas muy estrechas, evaluaremos si es necesario reducir el límite inferior a `0.875rem` (`15.75px`).
- **[Riesgo]** Desbordamiento en componentes horizontales (ej. tablas anchas en agenda o clientes).
  - _Mitigación:_ Mantener desbordamiento horizontal controlado (`overflow-x-auto`) en las tablas y garantizar que la rejilla principal de layout use `w-full` y no anchos fijos.

## Migration Plan

1. **Fase 1 (globals.css):** Declarar la variable `--spacing-gutter` en `@theme` con el valor `clamp()`. Eliminar variables obsoletas si las hay.
2. **Fase 2 (Vistas de Clientes, Sedes, Admin, Ajustes):** Reemplazar `p-margin-mobile md:p-gutter` y espaciados estáticos por `p-gutter` (y clases de layout equivalentes).
3. **Fase 3 (Agenda):** Adaptar la separación entre la cabecera temporal y la rejilla horaria principal al token `gutter`.
4. **Fase 4 (Dashboard):** Confirmar que toda la rejilla principal y tarjetas del dashboard usan `gutter` de manera homogénea.
