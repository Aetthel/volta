## ADDED Requirements

### Requirement: Combobox no buscable para opciones simples
El componente `Combobox` SHALL permitir la desactivación opcional de la barra de filtrado de texto superior (`searchable={false}`) para actuar como un desplegable directo de opciones fijas.

#### Scenario: Desactivación de búsqueda en desplegables de hora y minuto
- **WHEN** el componente `Combobox` se instancia con la propiedad `searchable={false}`
- **THEN** el menú de opciones flotante oculta el input de búsqueda con lupa, mostrando únicamente la lista de opciones de forma estática.

## MODIFIED Requirements

### Requirement: Modales interactivos de creación
El sistema SHALL proporcionar diálogos modales para la adición de clientes (`AddClientModal`), la creación de servicios (`AddServiceModal`) y la creación de citas (`NewAppointmentModal`) utilizando componentes centralizados de control de entrada como `FloatingInput`, `Combobox` y `FloatingTextarea` para garantizar la consistencia visual y de comportamiento. Los controles de entrada SHALL soportar una variante minimalista (`variant="minimal"`) que elimine contornos y cajas, utilizando en su lugar alineación en filas guiadas por iconos y subrayados de foco. Toda la estructura del modal, sus botones y la redondez de los elementos SHALL ajustarse dinámicamente según la escala de redondez configurada por el usuario (`--radius-scale`) en lugar de fijar valores estáticos. Además, la capa de fondo (`backdrop`) SHALL ser translúcida clara (`bg-black/5` o `bg-transparent`) sin aplicar filtros de desenfoque de fondo.

#### Scenario: Apertura y envío en modales de creación con controles estandarizados
- **WHEN** el usuario pulsa en "Nueva Cita" o "Añadir Cliente" y completa el formulario correspondiente
- **THEN** todos los campos de entrada de datos utilizan componentes minimalistas (`FloatingInput`, `Combobox`, `FloatingTextarea`) en formato fila con un icono guía a la izquierda, bordes exteriores ausentes, y botones de confirmación en formato de píldoras escalables que respetan la escala de redondez activa del usuario, flotando sobre una capa de fondo clara no emborronada.
