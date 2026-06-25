# Capability: Appointment Management

## Purpose
TBD - This capability handles appointment data, tracking, and API access.
## Requirements
### Requirement: Appointment Data Model
The system SHALL maintain `Appointment` records containing client name, client phone (international format), appointment date/time, and status.

#### Scenario: Validating appointment fields
- **WHEN** an Appointment record is saved
- **THEN** it MUST include clientName, clientPhone, appointmentDate, and businessId

### Requirement: Appointment Status Tracking
Each appointment SHALL have one of three states: `PENDING`, `SENT`, or `ERROR`.

#### Scenario: Initializing new appointments
- **WHEN** a new appointment is inserted via API
- **THEN** its status MUST default to `PENDING`

### Requirement: Secure Appointment Insertion API
The system SHALL provide a `POST /api/appointments` endpoint protected by a static API Key.

#### Scenario: Successful appointment insertion
- **WHEN** a POST request is made to `/api/appointments` with a valid API Key and correct JSON body
- **THEN** the system MUST create a new Appointment record and return a 201 Created status

#### Scenario: Unauthorized API access
- **WHEN** a request is made to `/api/appointments` with an invalid or missing API Key
- **THEN** the system MUST return a 401 Unauthorized status

### Requirement: Visual Agenda View
The system SHALL provide a clear and intuitive view (calendar or list) of all appointments for the logged-in business.

#### Scenario: Business views today's agenda
- **WHEN** a Business user accesses the main dashboard
- **THEN** the system displays all appointments for the current day, sorted by time

### Requirement: Quick Appointment Creation Form
The system SHALL provide a minimal form to schedule a new appointment with the least amount of friction (Mobile-first UX).

#### Scenario: Business schedules a new client
- **WHEN** the user opens the "Quick Add" form and enters name, phone, and date/time
- **THEN** the system creates the appointment and triggers the instant WhatsApp confirmation (if configured)

### Requirement: Simple Appointment Cancellation
The system SHALL allow the business to quickly cancel an appointment from the agenda view.

#### Scenario: Business cancels an appointment
- **WHEN** the user clicks "Cancel" on an existing appointment
- **THEN** the system marks it as cancelled and removes it from the active agenda

### Requirement: Agenda Context Menu Actions
La vista de agenda (calendario) y sus tarjetas de cita individuales SHALL soportar menús contextuales rápidos para acelerar las tareas de gestión sin tener que abrir modales complejos o hacer múltiples clics de navegación.

#### Scenario: Clic derecho en tarjeta de cita muestra acciones de edición, estado y eliminación
- **WHEN** el usuario hace clic derecho o pulsación prolongada sobre una cita existente en el calendario
- **THEN** se abre el menú contextual mostrando opciones para "Editar/Ver Cita", un selector para cambiar el estado de la cita (`PENDING`, `SENT`, `ERROR`) y la opción de "Eliminar Cita".

#### Scenario: Clic derecho en ranura horaria vacía abre acción de reserva rápida
- **WHEN** el usuario hace clic derecho o pulsación prolongada sobre un área o celda vacía de la cuadrícula horaria de un día concreto
- **THEN** se abre el menú contextual con la opción "Nueva cita a esta hora", y al hacer clic sobre ella se abre el modal de creación de cita con los campos de fecha y hora preestablecidos según el bloque horario seleccionado.

### Requirement: Vista de Agenda Dedicada
El sistema SHALL proveer una página dedicada exclusivamente a la visualización tridimensional o en rejilla horaria del calendario semanal y diario bajo la ruta `/agenda`.

#### Scenario: Visualización del calendario completo
- **WHEN** el usuario accede a la ruta `/agenda`
- **THEN** el sistema renderiza la rejilla horaria de citas (semanal o diaria) con soporte para clic derecho, menús contextuales y guías flotantes, aprovechando todo el ancho de la pantalla sin solapamiento de paneles informativos, aplicando un posicionamiento dinámico de citas solapadas con solape visual tridimensional y expansión horizontal inteligente, tarjetas sólidas con colores correspondientes a la categoría del servicio y esquinas poco redondeadas.

### Requirement: Panel de Control de Citas de Hoy en Dashboard
La página principal de inicio (`/inicio`) SHALL estructurarse bajo la estética de "Clinical Elegance" mediante una rejilla responsiva (de 10 columnas en pantallas grandes), mostrando las tarjetas de métricas optimizadas con efectos de elevación y barra de progreso, un saludo dinámico y personalizado, un listado de citas de hoy con diseño de línea de tiempo alineada geométricamente (sin bordes de color de servicio a la izquierda ni indicadores del estado Pendiente), un widget de WhatsApp Live con indicador de estado animado y estadísticas, y un gráfico de barras horizontales de popularidad para los servicios. Todos los elementos y bloques del dashboard SHALL estar espaciados de forma simétrica tanto en horizontal como en vertical utilizando la variable de espaciado estándar `gutter` (24px) para garantizar la coherencia geométrica y la escalabilidad del layout.

#### Scenario: Visualización de citas diarias en el Dashboard
- **WHEN** un usuario con rol de JEFE o EMPLEADO entra en el panel `/inicio`
- **THEN** el sistema muestra un saludo personalizado en base al día y la hora, las tarjetas de estadísticas elevadas (con barra de progreso para la ocupación), un listado de citas diarias con formato de línea de tiempo alineada perfectamente con los nodos en el eje de la línea vertical, mostrando tarjetas con redondez estándar y sin barras de color lateral, ocultando el badge de estado cuando está Pendiente y soportando menú contextual Figma-style para las acciones, el widget de WhatsApp y el ranking de servicios. Todos los espaciados (márgenes inferiores y gaps de rejillas) miden exactamente lo mismo (`gutter`).

