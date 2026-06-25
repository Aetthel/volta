# reusable-ui-components Specification

## Purpose
TBD - created by archiving change migrate-stitch-design. Update Purpose after archive.
## Requirements
### Requirement: Componentes comunes de navegación y estadísticas
El sistema SHALL estructurar componentes reutilizables como `Sidebar`, `BottomNav`, `Header` y `MetricCard` con un estilo uniforme y tipografías consistentes.

#### Scenario: Resaltado dinámico del menú de navegación
- **WHEN** el usuario navega a través de los enlaces de `Sidebar` en escritorio o `BottomNav` en móvil
- **THEN** el componente correspondiente aplica el estilo activo resaltado en base a la ruta actual (`usePathname()`)

### Requirement: Modales interactivos de creación
El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput`, `Select` y `Textarea` para garantizar la consistencia visual y de comportamiento.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados
- **WHEN** el usuario pulsa en "Nueva Cita", "Añadir Cliente" o "Añadir Servicio" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de datos utilizan componentes unificados (`FloatingInput` para campos de texto simples con iconos, `Select` para menús desplegables y `Textarea` para áreas multilínea) con validaciones y estilos homogéneos.

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

### Requirement: Componente de botón estandarizado
El sistema SHALL proporcionar un componente de botón reutilizable (`Button`) con variantes de estilo consistentes y tipografía que evite el uso de letras negritas (`font-bold` o `font-semibold`), utilizando en su lugar un peso medio (`font-medium`).

#### Scenario: Visualización del botón primario
- **WHEN** un botón utiliza la variante `primary`
- **THEN** se muestra con fondo de color primario (`bg-primary`), texto de contraste (`text-on-primary`) de color blanco por defecto sin conflictos de fusión de clases, y tipografía de peso medio (`font-medium`) sin utilizar negrita.

### Requirement: Componente de Menú Contextual Estilo Figma
El sistema SHALL proporcionar un conjunto de componentes reutilizables de menú contextual (`ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`) en `volta-ui.tsx` para gestionar menús de clic derecho (desktop) y de pulsación prolongada (móviles/táctiles). Este componente debe seguir los estándares visuales de Volta UI con tipografía en peso medio/semibold, bordes redondeados y micro-animaciones de entrada de escala/opacidad.

#### Scenario: Clic derecho sobre el disparador abre el menú en las coordenadas del cursor
- **WHEN** el usuario realiza un clic derecho (evento `contextmenu`) sobre un elemento envuelto en `ContextMenuTrigger`
- **THEN** el sistema previene el comportamiento por defecto del navegador y despliega el componente `ContextMenuContent` justo en la posición X e Y del cursor, con una transición suave de entrada y adaptándose a los límites de la pantalla para evitar desbordamientos.

#### Scenario: Pulsación prolongada en móvil despliega el menú contextual
- **WHEN** un usuario en un dispositivo táctil mantiene presionado un elemento envuelto en `ContextMenuTrigger` durante más de 500 ms (evento `touchstart`/`touchend` con temporizador)
- **THEN** el sistema despliega el menú contextual (`ContextMenuContent`) en la posición táctil del usuario de forma análoga al comportamiento de escritorio.

### Requirement: Agenda en Menús de Navegación
El sistema de navegación principal (tanto `Sidebar` en escritorio como `BottomNav` en dispositivos móviles) SHALL incluir un elemento de enlace directo para la vista de la "Agenda" utilizando el icono de calendario y apuntando a la ruta `/agenda`.

#### Scenario: Visualización del enlace de agenda en escritorio
- **WHEN** un usuario con rol de JEFE o EMPLEADO inicia sesión y carga el panel lateral `Sidebar` en escritorio
- **THEN** el sistema renderiza el enlace "Agenda" con el icono de calendario en el menú de navegación principal.

#### Scenario: Visualización del enlace de agenda en móvil
- **WHEN** un usuario con rol de JEFE o EMPLEADO carga la aplicación desde un dispositivo móvil
- **THEN** la barra de navegación inferior `BottomNav` incluye un acceso directo llamado "Agenda" con el icono de calendario correspondiente.

### Requirement: Rejilla Adaptable de Panel de Control
El layout del panel principal (`/inicio`) SHALL estructurarse mediante una rejilla responsiva basada en 10 columnas en pantallas medianas y grandes, distribuyéndose en una proporción de 6 columnas (60%) para el listado de citas y 4 columnas (40%) para la columna lateral de utilidades, colapsando a 1 columna en móviles.

#### Scenario: Visualización responsiva en tablets y ordenadores
- **WHEN** la aplicación se carga en una pantalla de tamaño tablet (ancho >= 768px) o de escritorio
- **THEN** el sistema renderiza la rejilla del panel de control alineada horizontalmente en proporción 6/4 (col-span-6 y col-span-4).

