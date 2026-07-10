## MODIFIED Requirements

### Requirement: Componentes comunes de navegación y estadísticas
El sistema SHALL estructurar componentes reutilizables como `Sidebar`, `BottomNav`, `Header` y `MetricCard` con un estilo uniforme y tipografías consistentes.

#### Scenario: Resaltado dinámico del menú de navegación
- **WHEN** el usuario navega a través de los enlaces de `Sidebar` en escritorio o `BottomNav` en móvil
- **THEN** el componente correspondiente aplica el estilo activo resaltado en base a la ruta actual (`usePathname()`)

#### Scenario: Nombres unificados en menús de navegación
- **WHEN** el administrador global accede a la plataforma
- **THEN** tanto el componente `Sidebar` como `BottomNav` muestran la pestaña del panel de administración con el nombre "Control Global" de forma unificada.

### Requirement: Componentes comunes de estado vacío y carga
El sistema SHALL proporcionar componentes comunes para representar estados vacíos (`EmptyState`) y placeholders de carga animados (`Skeleton`) para garantizar que todas las páginas utilicen el mismo patrón visual al cargar datos o al mostrar vistas vacías.

#### Scenario: Renderizado de Skeleton durante la carga
- **WHEN** el componente de negocio o la página está realizando una petición de datos (loading)
- **THEN** el sistema renderiza marcadores de posición (`Skeleton`) con efecto de animación pulse en lugar de un indicador textual estático.

#### Scenario: Visualización de EmptyState sin datos
- **WHEN** una lista de registros, tabla de clientes o buscador no encuentra información para mostrar
- **THEN** el sistema visualiza el componente `EmptyState` que contiene un icono descriptivo de Lucide, un mensaje explicativo y una llamada a la acción opcional.

#### Scenario: Skeletons de página en cargas asíncronas
- **WHEN** el usuario accede a las páginas de `/inicio`, `/agenda`, `/clientes`, `/sedes` o `/admin` y el sistema inicia las peticiones asíncronas de datos
- **THEN** el sistema renderiza marcadores de posición `Skeleton` correspondientes a la estructura de la página, ocultando las alertas de vacío y el contenido definitivo hasta completar el fetch.
