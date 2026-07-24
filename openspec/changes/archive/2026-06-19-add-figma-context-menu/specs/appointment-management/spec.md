## ADDED Requirements

### Requirement: Agenda Context Menu Actions

La vista de agenda (calendario) y sus tarjetas de cita individuales SHALL soportar menús contextuales rápidos para acelerar las tareas de gestión sin tener que abrir modales complejos o hacer múltiples clics de navegación.

#### Scenario: Clic derecho en tarjeta de cita muestra acciones de edición, estado y eliminación

- **WHEN** el usuario hace clic derecho o pulsación prolongada sobre una cita existente en el calendario
- **THEN** se abre el menú contextual mostrando opciones para "Editar/Ver Cita", un selector para cambiar el estado de la cita (`PENDING`, `SENT`, `ERROR`) y la opción de "Eliminar Cita".

#### Scenario: Clic derecho en ranura horaria vacía abre acción de reserva rápida

- **WHEN** el usuario hace clic derecho o pulsación prolongada sobre un área o celda vacía de la cuadrícula horaria de un día concreto
- **THEN** se abre el menú contextual con la opción "Nueva cita a esta hora", y al hacer clic sobre ella se abre el modal de creación de cita con los campos de fecha y hora preestablecidos según el bloque horario seleccionado.
