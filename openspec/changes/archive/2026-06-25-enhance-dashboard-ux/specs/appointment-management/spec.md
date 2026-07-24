## MODIFIED Requirements

### Requirement: Panel de Control de Citas de Hoy en Dashboard

La página principal de inicio (`/inicio`) SHALL estructurarse bajo la estética de "Clinical Elegance" mediante una rejilla responsiva (de 10 columnas en pantallas grandes), mostrando las tarjetas de métricas optimizadas con efectos de elevación y barra de progreso, un saludo dinámico y personalizado con el estado del día, un listado de citas de hoy con diseño de línea de tiempo con colores por tipo de servicio, un widget de WhatsApp Live con indicador de estado animado (pulsing glow) y estadísticas rápidas de envío, y un gráfico de barras horizontales de popularidad para los servicios solicitados.

#### Scenario: Visualización de citas diarias en el Dashboard

- **WHEN** un usuario con rol de JEFE o EMPLEADO entra en el panel `/inicio`
- **THEN** el sistema muestra un saludo personalizado en base al día y la hora, las tarjetas de estadísticas elevadas (con barra de progreso para la ocupación), un listado de citas diarias con formato de línea de tiempo con colores distintivos por servicio y soporte de menú contextual Figma-style (para marcar como enviada/con error o eliminar cita), el widget del bot de WhatsApp con indicador dinámico (pulsing dot) y estadísticas de hoy, y el ranking de servicios populares con barras de progreso horizontales.
