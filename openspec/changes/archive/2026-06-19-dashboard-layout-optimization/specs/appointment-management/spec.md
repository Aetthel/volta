## MODIFIED Requirements

### Requirement: Panel de Control de Citas de Hoy en Dashboard
La página principal de inicio (`/inicio`) SHALL sustituir la cuadrícula completa del calendario por un listado ordenado cronológicamente de las citas correspondientes al día de hoy, optimizando la visibilidad diaria sin saturar la interfaz de forma adaptativa y fluida sin alturas fijas.

#### Scenario: Visualización de citas diarias en el Dashboard
- **WHEN** un usuario con rol de JEFE o EMPLEADO entra en el panel `/inicio`
- **THEN** el sistema muestra las tarjetas de estadísticas arriba y, justo debajo, una lista vertical secuencial con las citas programadas para el día de hoy, mostrando el nombre del cliente, el servicio, la hora y el estado de la cita, adaptando la altura del panel al volumen real de citas sin contenedores internos con scroll y sin botón redundante en el estado vacío.
