## ADDED Requirements

### Requirement: Componentes comunes de navegación y estadísticas
El sistema SHALL estructurar componentes reutilizables como `Sidebar`, `BottomNav`, `Header` y `MetricCard` con un estilo uniforme y tipografías consistentes.

#### Scenario: Resaltado dinámico del menú de navegación
- **WHEN** el usuario navega a través de los enlaces de `Sidebar` en escritorio o `BottomNav` en móvil
- **THEN** el componente correspondiente aplica el estilo activo resaltado en base a la ruta actual (`usePathname()`)

### Requirement: Modales interactivos de creación
El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`) y la creación de citas (`NewAppointmentModal`) reutilizables desde cualquier pantalla.

#### Scenario: Apertura y envío en modales de creación
- **WHEN** el usuario pulsa en "Nueva Cita" o "Añadir Cliente" y completa el formulario correspondiente
- **THEN** el modal recopila los datos ingresados, ejecuta la función de guardado y se cierra de forma animada
