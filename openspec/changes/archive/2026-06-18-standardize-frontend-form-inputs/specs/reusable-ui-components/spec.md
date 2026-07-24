## MODIFIED Requirements

### Requirement: Modales interactivos de creación

El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput` para garantizar la consistencia visual y de comportamiento.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados

- **WHEN** el usuario pulsa en "Nueva Cita", "Añadir Cliente" o "Añadir Servicio" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de texto utilizan `FloatingInput` con etiquetas flotantes y validaciones nativas de HTML5.
