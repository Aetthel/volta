## ADDED Requirements

### Requirement: Componentes comunes de estado vacío y carga
El sistema SHALL proporcionar componentes comunes para representar estados vacíos (`EmptyState`) y placeholders de carga animados (`Skeleton`) para garantizar que todas las páginas utilicen el mismo patrón visual al cargar datos o al mostrar vistas vacías.

#### Scenario: Renderizado de Skeleton durante la carga
- **WHEN** el componente de negocio o la página está realizando una petición de datos (loading)
- **THEN** el sistema renderiza marcadores de posición (`Skeleton`) con efecto de animación pulse en lugar de un indicador textual estático.

#### Scenario: Visualización de EmptyState sin datos
- **WHEN** una lista de registros, tabla de clientes o buscador no encuentra información para mostrar
- **THEN** el sistema visualiza el componente `EmptyState` que contiene un icono descriptivo de Lucide, un mensaje explicativo y una llamada a la acción opcional.

### Requirement: Contenedores de tarjetas estandarizados
El sistema SHALL estructurar los paneles de control y secciones informativas de la aplicación mediante la composición unificada de `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent` y `CardFooter`) de `volta-ui.tsx` para evitar la replicación manual de estilos de contenedor.

#### Scenario: Estructuración con Card
- **WHEN** se despliega una sección de datos complejos (ej. tabla de clientes, calendario semanal o tarjetas de sedes)
- **THEN** el sistema renderiza el componente `Card` unificado con bordes `rounded-2xl` y sombreado uniforme.

## MODIFIED Requirements

### Requirement: Modales interactivos de creación
El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput`, `Select` y `Textarea` para garantizar la consistencia visual y de comportamiento.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados
- **WHEN** el usuario pulsa en "Nueva Cita", "Añadir Cliente" o "Añadir Servicio" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de datos utilizan componentes unificados (`FloatingInput` para campos de texto simples con iconos, `Select` para menús desplegables y `Textarea` para áreas multilínea) con validaciones y estilos homogéneos.
