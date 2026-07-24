## MODIFIED Requirements

### Requirement: Modales interactivos de creación

El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput`, `Select` y `Textarea` para garantizar la consistencia visual y de comportamiento. Todos los campos de entrada de datos (`FloatingInput`, `Select` y `Textarea`) SHALL implementar un radio de esquina de 4px (`rounded-sm`) para diferenciarse de los contenedores generales.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados

- **WHEN** el usuario pulsa en "Nueva Cita", "Añadir Cliente" o "Añadir Servicio" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de datos utilizan componentes unificados (`FloatingInput` para campos de texto simples con iconos, `Select` para menús desplegables y `Textarea` para áreas multilínea) con validaciones y estilos homogéneos, incluyendo bordes redondeados con radio de 4px (`rounded-sm`).

### Requirement: Contenedores de tarjetas estandarizados

El sistema SHALL estructurar los paneles de control y secciones informativas de la aplicación mediante la composición unificada de `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent` y `CardFooter`) de `volta-ui.tsx` para evitar la replicación manual de estilos de contenedor.

#### Scenario: Estructuración con Card

- **WHEN** se despliega una sección de datos complejos (ej. tabla de clientes, calendario semanal o tarjetas de sedes)
- **THEN** el sistema renderiza el componente `Card` unificado con bordes `rounded-default` (0.5rem / 8px) y sombreado uniforme.
