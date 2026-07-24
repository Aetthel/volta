## Context

El panel de control actual en `/inicio` es funcional pero visualmente plano e inerte. Para alinearse con las directrices de diseño **Clinical Elegance**, es necesario inyectar dinamismo visual y mejorar la jerarquía tipográfica sin saturar la interfaz. Esto incluye añadir visualización de datos ligera y mejorar el flujo de acciones rápidas sobre las citas del día.

## Goals / Non-Goals

**Goals:**

- Implementar un saludo dinámico y personalizado con el estado del día.
- Rediseñar `MetricCard` para soportar estados hover interactivos, fondos tonales en iconos y barras de progreso empotradas.
- Representar el listado de citas de hoy en formato de línea de tiempo con un borde coloreado según la categoría del servicio.
- Integrar el componente `ContextMenu` (estilo Figma) en el listado de citas para realizar las acciones rápidas (`Marcar Enviada`, `Marcar Error`, `Eliminar Cita`), eliminando la fila de botones ruidosa.
- Mejorar el widget de WhatsApp con un indicador de estado dinámico (pulsing dot) y estadísticas de envíos.
- Añadir barras de progreso horizontales relativas en el ranking de servicios populares.

**Non-Goals:**

- Modificar el backend de la aplicación, el esquema de base de datos o el bot de WhatsApp (solo consumo y representación visual de datos en el frontend).
- Modificar la vista de agenda general `/agenda` (el cambio está acotado exclusivamente al dashboard `/inicio`).

## Decisions

### 1. Utilización de ContextMenu en lugar de Botones de Fila

- **Decisión:** Ocultar los botones directos (`Check`, `AlertCircle`, `Trash2`) en la fila de la cita y habilitar el componente `ContextMenu` de `volta-ui.tsx` al hacer clic derecho (o pulsación prolongada en móvil).
- **Razón:** Los botones de fila sobrecargan visualmente la interfaz y compiten por la atención. El menú contextual estilo Figma es más limpio, coherente con las especificaciones del sistema de diseño y ya está soportado a nivel de infraestructura.
- **Alternativa considerada:** Mostrar los botones solo al hacer hover sobre la tarjeta de la cita. Sin embargo, esto no soluciona la experiencia en dispositivos móviles/táctiles, mientras que `ContextMenu` tiene soporte nativo para pulsación prolongada (touch-hold).

### 2. Barras de Progreso Horizontales Nativas (Tailwind CSS)

- **Decisión:** Para el ranking de servicios populares, utilizaremos contenedores div anidados con anchos porcentuales dinámicos de Tailwind en lugar de instalar librerías externas de gráficos (como Chart.js o Recharts).
- **Razón:** Minimiza el impacto en el tamaño del bundle, es extremadamente rápido de renderizar y permite un control completo del estilo y degradados nativos dentro del tema de "Clinical Elegance".

### 3. Timeline de Citas con Flexbox/Grid e Indicadores de Color

- **Decisión:** Diseñar la línea de tiempo mediante divs absolutos y pseudo-elementos usando bordes punteados de Tailwind. Asignaremos un color a la izquierda de la cita basándonos en mapeos estáticos del nombre del servicio (ej. "Corte" = primary/teal, "Color" = secondary/teal, "Tratamiento" = tertiary/teal).
- **Razón:** Aporta una lectura rápida y estructurada al estilista de forma visual, agrupando las citas del día por su naturaleza de forma intuitiva.

## Risks / Trade-offs

- **[Risk] Descubribilidad del menú contextual:** Los usuarios podrían no saber que pueden hacer clic derecho o mantener pulsado para gestionar el estado de una cita.
  - _Mitigación:_ Añadiremos la clase `cursor-context-menu` a la tarjeta de la cita, un sutil indicador visual (tres puntos verticales `MoreVertical` en la esquina derecha que disparen el menú) y un estado de hover diferenciado para invitar a la interacción.
- **[Risk] Rendimiento en listas largas:** La carga de muchos nodos de ContextMenu puede saturar el DOM.
  - _Mitigación:_ El dashboard de inicio está limitado únicamente a las citas de hoy (normalmente < 15-20 registros), por lo que el impacto en el DOM es despreciable.
