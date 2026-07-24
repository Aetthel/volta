## ADDED Requirements

### Requirement: Vista de Agenda Dedicada

El sistema SHALL proveer una página dedicada exclusivamente a la visualización tridimensional o en rejilla horaria del calendario semanal y diario bajo la ruta `/agenda`.

#### Scenario: Visualización del calendario completo

- **WHEN** el usuario accede a la ruta `/agenda`
- **THEN** el sistema renderiza la rejilla horaria de citas (semanal o diaria) con soporte para clic derecho, menús contextuales y guías flotantes, aprovechando todo el ancho de la pantalla sin solapamiento de paneles informativos.

### Requirement: Panel de Control de Citas de Hoy en Dashboard

La página principal de inicio (`/inicio`) SHALL sustituir la cuadrícula completa del calendario por un listado ordenado cronológicamente de las citas correspondientes al día de hoy, optimizando la visibilidad diaria sin saturar la interfaz.

#### Scenario: Visualización de citas diarias en el Dashboard

- **WHEN** un usuario con rol de JEFE o EMPLEADO entra en el panel `/inicio`
- **THEN** el sistema muestra las tarjetas de estadísticas arriba y, justo debajo, una lista vertical secuencial con las citas programadas para el día de hoy, mostrando el nombre del cliente, el servicio, la hora y el estado de la cita.
