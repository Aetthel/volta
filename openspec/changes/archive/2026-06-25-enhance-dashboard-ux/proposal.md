## Why

El panel de control actual (`/inicio`) presenta una estética demasiado plana, monótona y con una sensación de vacío visual. Además, carece de elementos interactivos modernos, tiene botones de acción de fila que saturan visualmente el listado de citas, y no aprovecha la visualización de datos dinámica para las estadísticas ni el bot de WhatsApp, lo que resta valor y elegancia a la experiencia de usuario bajo la narrativa "Clinical Elegance".

## What Changes

- **Cabecera Dinámica y Mensaje de Bienvenida:** Saludo personalizado al estilista en base a la hora del día con un resumen ejecutivo rápido de las tareas y estado diario.
- **Metric Cards Elevadas:**
  - Efectos hover con elevación tridimensional y bordes sutiles con el color de la marca.
  - Contenedores de iconos con colores tonales semitransparentes asociados a la métrica.
  - Indicador visual dinámico (barra de progreso con degradado) en la tarjeta de Ocupación.
- **Timeline de Citas de Hoy:**
  - Estructuración del listado en un flujo de línea de tiempo con nodos visuales.
  - Integración de bordes o etiquetas de color a la izquierda de la cita basadas en la categoría de servicio (según las pautas de coloración del sistema de diseño).
  - Eliminación de botones de acción de fila en favor de un menú contextual estilizado ("Estilo Figma") con clic derecho o pulsación prolongada.
- **Widget de WhatsApp Live:**
  - Indicador de estado dinámico que pulse (pulsing live indicator) si está conectado.
  - Adición de métricas rápidas de envíos realizados hoy.
- **Visualización de Servicios Populares:**
  - Sustitución de la lista numerada estática por un gráfico de barras horizontales de popularidad relativa.

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `appointment-management`: Se modificará el requisito "Panel de Control de Citas de Hoy en Dashboard" para incorporar la estructura visual en formato de línea de tiempo, el uso de colores asociados a categorías de servicio en las tarjetas individuales y la integración obligatoria de las acciones del menú contextual (Figma-style) para la manipulación del estado y eliminación de citas directas del día.

## Impact

- `frontend/app/inicio/page.tsx`: Modificación completa del layout de inicio, MetricCards, lista de citas y widgets laterales.
- `frontend/components/MetricCard.tsx`: Adaptación para soportar micro-interacciones, hover dinámico, barras de progreso empotradas y colores tonales.
- `frontend/components/ui/volta-ui.tsx`: Uso del componente ContextMenu y adaptación si fuera necesario.
