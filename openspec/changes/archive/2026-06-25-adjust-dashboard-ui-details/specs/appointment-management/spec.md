## MODIFIED Requirements

### Requirement: Panel de Control de Citas de Hoy en Dashboard
La página principal de inicio (`/inicio`) SHALL estructurarse bajo la estética de "Clinical Elegance" mediante una rejilla responsiva (de 10 columnas en pantallas grandes), mostrando las tarjetas de métricas optimizadas con efectos de elevación y barra de progreso, un saludo dinámico y personalizado, un listado de citas de hoy con diseño de línea de tiempo alineada geométricamente (sin bordes de color de servicio a la izquierda ni indicadores del estado Pendiente), un widget de WhatsApp Live con indicador de estado animado y estadísticas, y un gráfico de barras horizontales de popularidad para los servicios.

#### Scenario: Visualización de citas diarias en el Dashboard
- **WHEN** un usuario con rol de JEFE o EMPLEADO entra en el panel `/inicio`
- **THEN** el sistema muestra un saludo personalizado en base al día y la hora, las tarjetas de estadísticas elevadas (con barra de progreso para la ocupación), un listado de citas diarias con formato de línea de tiempo alineada perfectamente con los nodos en el eje de la línea vertical, mostrando tarjetas con redondez estándar y sin barras de color lateral, ocultando el badge de estado cuando está Pendiente y soportando menú contextual Figma-style para las acciones, el widget de WhatsApp y el ranking de servicios.
