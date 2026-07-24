## Why

Corregir el color de texto del botón principal (que actualmente se muestra oscuro en lugar de blanco por defecto) utilizando el token semántico de contraste del sistema de diseño (`text-on-primary`).

## What Changes

- Modificar la clase del botón principal en `volta-ui.tsx` para usar `text-on-primary` y `hover:text-on-primary` en lugar de `text-white` y `hover:text-white`.

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `reusable-ui-components`: Corrección del color de contraste de texto en la variante `primary` del componente unificado `Button`.

## Impact

- `frontend/components/ui/volta-ui.tsx`: Modificación de las clases de color de texto en el componente `Button`.
