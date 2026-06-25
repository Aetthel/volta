## 1. Modificar MetricCard y Estilos Visuales

- [x] 1.1 Modificar `MetricCard.tsx` para aceptar hover dinámico (transición de sombras y escala ligera) y soporte opcional para barras de progreso internas.
- [x] 1.2 Actualizar las tarjetas del panel `/inicio` en `page.tsx` para usar las nuevas propiedades de `MetricCard`, inyectando el color de fondo tonal en los iconos y la barra de progreso en la tarjeta de ocupación.

## 2. Rediseñar la Cabecera de Inicio y Saludo

- [x] 2.1 Diseñar el bloque de cabecera con saludo personalizado dinámico en base a la hora actual ("Buenos días", "Buenas tardes") y resumen cuantitativo ejecutivo de las citas y estados de notificación.

## 3. Implementar Timeline y Menú Contextual de Citas

- [x] 3.1 Integrar el componente `ContextMenu` en cada tarjeta de cita en `page.tsx`, mapeando clic derecho y pulsación prolongada a las funciones de estado (`SENT`, `ERROR`) y eliminación.
- [x] 3.2 Agregar el indicador visual de línea de tiempo vertical y nodo gráfico para el listado de citas de hoy.
- [x] 3.3 Mapear nombres de servicio ("Corte", "Color", etc.) a clases de borde de color a la izquierda de la tarjeta de cita (Clinical Elegance) para diferenciación visual.
- [x] 3.4 Eliminar el panel de botones individuales antiguos en las filas de citas para simplificar la interfaz.

## 4. Mejorar Widgets Laterales (WhatsApp y Servicios)

- [x] 4.1 Modificar el estado del bot de WhatsApp para incluir un elemento visual verde/naranja/gris que pulse (CSS core `@keyframes ping` o similar) y agregar un texto descriptivo secundario de los mensajes enviados hoy.
- [x] 4.2 Reemplazar la lista numerada estática de servicios populares por barras de progreso horizontales relativas, calculando el porcentaje dinámico de reservas en el cliente.
