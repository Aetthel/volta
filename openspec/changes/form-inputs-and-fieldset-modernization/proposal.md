## Why

Los componentes de entrada de formularios actuales (`Input`, `Field`) carecen de elementos semánticos estándar como `Fieldset`, `FieldsetLegend` y `FieldError` dedicados, y la estética de los inputs tradicionales no aprovecha todo el potencial visual de los nuevos patrones de diseño modernos (como el patrón de formulario `v-fieldset-6` de 21st.dev / shadcn). Es necesario modernizar y estandarizar la capa de componentes de formulario para ofrecer una experiencia estética superior, garantizando al mismo tiempo total compatibilidad con los tokens semánticos, el radio dinámico (`--radius-scale`) y la escala tipográfica configurable en Ajustes.

## What Changes

- **Componentes `Fieldset` y `FieldsetLegend`**: Creación de componentes semánticos para agrupaciones de formularios (`<fieldset>`, `<legend>`) con espaciado consistente y tipografía estructurada.
- **Modernización de `Input`**: Rediseño del componente `<Input />` con altura estandarizada (`h-10`/`h-9`), bordes sutiles reactivos (`border-outline-variant`), soporte para clases de radio dinámico (`rounded-xl`/`rounded-lg`), anillo de enfoque de alto contraste (`focus-visible:ring-2 focus-visible:ring-primary/40`), sombras refinadas (`shadow-xs`) y estilos accesibles para estados de error (`aria-invalid:border-error`).
- **Ampliación de `Field`, `FieldLabel`, `FieldDescription` y `FieldError`**:
  - `FieldLabel`: Soporte nativo para indicadores obligatorios/asteriscos (`text-destructive-foreground` / `text-error`), accesibilidad (`peer-disabled`).
  - `FieldError`: Componente dedicado para mensajes de validación con `role="alert"`, tipografía `text-xs font-medium text-error` e icono o espaciado fluido.
  - `FieldDescription`: Texto de ayuda contextual con tokens `text-on-surface-variant/80`.
- **Exportación en `volta-ui.tsx`**: Exposición centralizada de todos los nuevos componentes atómicos para consumo inmediato en cualquier vista.
- **Componente de Demostración `v-fieldset-6`**: Creación del componente de demostración de formulario de pago de referencia en `frontend/components/ui/v-fieldset-6.tsx` y su showcase para verificar la renderización visual en diferentes radios y temas.

## Capabilities

### Modified Capabilities
- `reusable-ui-components`: Ampliación de la especificación para incluir el estándar de componentes de formulario (`Fieldset`, `FieldsetLegend`, `Field`, `FieldLabel`, `Input`, `FieldDescription`, `FieldError`) con soporte de radio dinámico y tokens semánticos.

## Impact

- **Archivos creados/modificados**:
  - `frontend/components/ui/fieldset.tsx` (nuevo)
  - `frontend/components/ui/field.tsx` (actualizado)
  - `frontend/components/ui/input.tsx` (actualizado)
  - `frontend/components/ui/volta-ui.tsx` (actualizado para exportar `Fieldset`, `FieldsetLegend`, `FieldError`)
  - `frontend/components/ui/v-fieldset-6.tsx` (nuevo componente de ejemplo de formulario de pago)
- **Compatibilidad**: 100% retrocompatible con los formularios existentes que ya consuman `Input` o `Field` de `volta-ui.tsx`.
