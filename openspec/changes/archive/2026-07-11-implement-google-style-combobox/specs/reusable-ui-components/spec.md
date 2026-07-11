## ADDED Requirements

### Requirement: Selectores de cabecera y filtros mediante Combobox
El sistema SHALL unificar los filtros de cabecera y selectores de opciones complejos (como el selector de estilistas en la vista de Agenda y el filtro de servicios en el listado de Clientes) utilizando el componente `Combobox` de estilo Google MD3 para permitir búsquedas dinámicas en tiempo real y consistencia estética.

#### Scenario: Filtrado en tiempo real en los controles de página
- **WHEN** el usuario hace clic en el filtro de servicios de clientes o el selector de estilistas en la agenda
- **THEN** el sistema abre un panel flotante que permite escribir texto para filtrar las opciones al instante, visualizando las opciones coincidentes y unificando el diseño visual de la cabecera.

## MODIFIED Requirements

### Requirement: Modales interactivos de creación
El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput`, `Combobox` (en sustitución de selectores nativos) y `Textarea` para garantizar la consistencia visual y de comportamiento. Los campos de texto y de área (`FloatingInput`, `Textarea`) SHALL implementar un radio de esquina de 4px (`rounded-sm`), mientras que los selectores desplegables dinámicos (`Combobox`) SHALL implementar contornos con un radio de esquina de 12px (`rounded-xl`) y menús de opciones en tarjetas flotantes con un radio de esquina de 16px (`rounded-2xl`) con estilo de fila en píldoras, replicando las especificaciones estéticas de Google Material Design 3.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados
- **WHEN** el usuario pulsa en "Nueva Cita", "Añadir Cliente" o "Añadir Servicio" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de datos utilizan componentes unificados (`FloatingInput` para campos de texto simples, `Combobox` para menús desplegables de búsqueda interactiva y `Textarea` para áreas multilínea) con validaciones y estilos homogéneos, incluyendo bordes redondeados con radio de 4px (`rounded-sm`) en campos de texto/área, y contornos redondeados de 12px (`rounded-xl`) con menús de 16px (`rounded-2xl`) en los Comboboxes de estilo Google.
