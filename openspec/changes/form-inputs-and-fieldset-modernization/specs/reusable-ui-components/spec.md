## ADDED Requirements

### Requirement: Modernización de componentes de control de formularios e Input

El sistema SHALL proporcionar componentes modulares de formulario (`Fieldset`, `FieldsetLegend`, `Field`, `FieldLabel`, `Input`, `FieldDescription`, `FieldError`) en la librería atómica Volta UI (`@/components/ui/volta-ui`) que sigan una estética moderna y accesible. Los componentes de entrada y agrupación SHALL consumir dinámicamente las variables de radio de bordes de la aplicación (`--radius-scale`, `--radius-lg`, `--radius-xl`) adaptándose al nivel de redondez configurado en Ajustes.

#### Scenario: Renderizado de Input con radio dinámico y foco reactivo
- **WHEN** un componente de formulario renderiza el elemento `<Input />`
- **THEN** se muestra con altura y padding estándar (`h-10` / `px-3`), bordes con tokens semánticos `border-outline-variant`, fondo `bg-surface`, y bordes redondeados vinculados a las clases de radio dinámico de Volta UI (`rounded-xl` / `rounded-lg`). Al recibir el foco, muestra un anillo de enfoque accesible `focus-visible:ring-2 focus-visible:ring-primary/40`.

#### Scenario: Renderizado de estados de error con FieldError y aria-invalid
- **WHEN** un campo de entrada posee un error de validación o la propiedad `aria-invalid="true"`
- **THEN** el `<Input />` activa el borde semántico de error (`border-error`), y el componente `<FieldError />` muestra el mensaje con `role="alert"` y color `text-error`.

#### Scenario: Agrupación semántica con Fieldset y FieldsetLegend
- **WHEN** se estructura una sección de formulario con `<Fieldset>` y `<FieldsetLegend>`
- **THEN** el sistema renderiza un contenedor semántico `<fieldset>` con distribución vertical flexible y un `<legend>` con tipografía estructurada y seguimiento consistente.

#### Scenario: Etiquetas accesibles con FieldLabel y FieldDescription
- **WHEN** un campo utiliza `<FieldLabel>` y `<FieldDescription>`
- **THEN** la etiqueta se asocia semánticamente al campo de entrada, soportando asteriscos obligatorios con estilos de contraste y descripciones en `text-on-surface-variant/80`.
