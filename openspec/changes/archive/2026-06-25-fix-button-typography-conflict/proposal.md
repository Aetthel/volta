## Why

Corregir el conflicto de fusión de clases de `tailwind-merge` en el componente `Button`. Al utilizar la clase tipográfica personalizada `text-label-lg` (que empieza por `text-`), `tailwind-merge` la confunde con una clase de color y descarta el color del texto (`text-on-primary`), resultando en que los botones muestren texto oscuro en lugar de blanco en su estado normal.

## What Changes

- Reemplazar las clases tipográficas personalizadas (`text-label-sm`, `text-label-md`, `text-label-lg`) en las variantes de tamaño del botón en `volta-ui.tsx` por las medidas equivalentes en formato rem estándar de Tailwind (`text-[0.7rem]`, `text-[0.75rem]`, `text-[0.875rem]`). Esto permite que `tailwind-merge` identifique correctamente la propiedad de tamaño y no interfiera con el color del texto.

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `reusable-ui-components`: Corrección en la integración de clases del componente `Button` para evitar conflictos en el DOM final.

## Impact

- `frontend/components/ui/volta-ui.tsx`: Modificación de las clases de tamaño de fuente en `sizeClasses`.
