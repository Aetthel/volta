## Context

Corrección del conflicto de tailwind-merge en Button.

## Goals / Non-Goals

**Goals:**
- Resolver el descarte de la clase `text-on-primary` en el componente `Button` sin perder el tamaño tipográfico de la marca.

## Decisions

- **Uso de valores rem explícitos en las clases de tamaño:**
  - Modificar las clases en `sizeClasses`:
    - `sm`: de `text-label-sm` a `text-[0.7rem]`
    - `md`: de `text-label-md` a `text-[0.75rem]`
    - `lg`: de `text-label-lg` a `text-[0.875rem]`
  - Al usar la sintaxis `text-[value]`, `tailwind-merge` identifica inequívocamente estas clases como pertenecientes al grupo `font-size` y no al grupo `color`, previniendo que remueva `text-on-primary`.
