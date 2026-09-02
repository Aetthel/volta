## 1. Creación de Componentes de Formulario y Fieldset

- [x] 1.1 Crear el componente `frontend/components/ui/fieldset.tsx` implementando `Fieldset` y `FieldsetLegend` con estilos semánticos y distribución adaptable.
- [x] 1.2 Actualizar `frontend/components/ui/field.tsx` para incorporar el componente `FieldError` con `role="alert"`, y sincronizar `Field`, `FieldLabel` (con soporte para `peer-disabled` e indicadores de requerido) y `FieldDescription`.
- [x] 1.3 Actualizar `frontend/components/ui/input.tsx` con soporte para bordes reactivos (`border-outline-variant`), clases de radio dinámico (`rounded-xl` / `rounded-lg`), anillo de foco `focus-visible:ring-primary/40` y estados `aria-invalid`.
- [x] 1.4 Exportar `Fieldset`, `FieldsetLegend`, `FieldError`, `Field`, `FieldLabel`, `FieldDescription` e `Input` en `frontend/components/ui/volta-ui.tsx`.

## 2. Componente de Referencia y Demostración

- [x] 2.1 Crear el componente de formulario `frontend/components/ui/v-fieldset-6.tsx` implementando el formulario de información de pago (Cardholder name, Card number, Expiry date, CVC) utilizando los nuevos componentes de Volta UI.
- [x] 2.2 Crear tests unitarios en `frontend/components/ui/form-components.test.tsx` para verificar el correcto renderizado de `Fieldset`, `FieldLabel`, `Input`, `FieldError` y estados inválidos.

## 3. Verificación de Compilación y Calidad

- [x] 3.1 Ejecutar `pnpm --filter frontend build` para verificar que todos los tipos de TypeScript compilan sin errores y que no existen importaciones rotas.
