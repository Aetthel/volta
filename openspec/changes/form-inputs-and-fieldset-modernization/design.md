## Context

Ver `proposal.md` para la motivación general. Volta UI cuenta con componentes base en `frontend/components/ui/` (`field.tsx`, `input.tsx`, `floating-input.tsx`), pero requiere modernización para adoptar la estructura modular de `Fieldset`, `Field`, `FieldLabel`, `Input`, `FieldDescription` y `FieldError` con soporte de radio dinámico y tokens semánticos.

## Goals / Non-Goals

**Goals:**
- Proporcionar componentes atómicos `Fieldset`, `FieldsetLegend`, `FieldError`, `Field`, `FieldLabel`, `FieldDescription` e `Input` listos para producción.
- Asegurar que todos los componentes respeten las variables de radio dinámico (`--radius-scale`, `rounded-xl`, `rounded-lg`) y la paleta de colores activa de Volta.
- Soportar validación visual con estados accesibles (`role="alert"`, `aria-invalid`, `group-data-[invalid]`).
- Replicar el patrón de formulario de referencia `v-fieldset-6` de forma limpia y reutilizable.

**Non-Goals:**
- No se reemplazarán forzosamente los campos de formularios existentes que utilizan `FloatingInput` si no es necesario; se mantendrá retrocompatibilidad total.
- No se añaden librerías externas pesadas adicionales; se utiliza Tailwind CSS y utilidades nativas existentes de Volta (`cn`).

## Decisions

- **Decisión 1: Módulo `fieldset.tsx` y ampliación de `field.tsx` e `input.tsx`**
  - *Razón*: Mantener la arquitectura modular atómica de Volta UI donde cada grupo de componentes reside en su archivo específico y se expone a través de `volta-ui.tsx`.
  - *Alternativa considerada*: Crear carpetas anidadas complejas (`v-fieldset-6-utils/`); se descartó para mantener la coherencia con el diseño del sistema del proyecto (`@/components/ui/...`).
- **Decisión 2: Clases de radio basadas en variables dinámicas**
  - *Razón*: `rounded-xl` y `rounded-lg` en Volta mapean a variables CSS (`--radius-xl`, `--radius-lg`) que se multiplican por `--radius-scale`. Esto garantiza que al cambiar el radio en Ajustes (Recto, Sutil, Medio, Pronunciado, Redondo), los inputs y fieldsets se adapten inmediatamente.
- **Decisión 3: Manejo de errores semántico con `aria-invalid` y `FieldError`**
  - *Razón*: Cumple con las normativas de accesibilidad WCAG y permite estilar tanto el `<input>` como el mensaje inferior sin duplicar lógica.

## Risks / Trade-offs

- **[Riesgo]** Posibles conflictos de padding o altura en formularios antiguos.  
  → *Mitigación*: Se conserva `InputProps` estándar de React y se usa `cn()` para permitir sobreescritura de clases si un formulario específico lo requiere.
