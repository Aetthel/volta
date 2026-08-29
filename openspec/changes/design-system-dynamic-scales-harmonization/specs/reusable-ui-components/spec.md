## ADDED Requirements

### Requirement: Jerarquía Tipográfica Homogénea Gobernada por `--font-scale`
Todas las vistas, tablas, tarjetas, barras de filtro, modales y botones del sistema SHALL consumir exclusivamente la escala de clases tipográficas dinámicas de Tailwind (`text-display-lg`, `text-headline-lg`, `text-title-md`, `text-body-md`, `text-sm`, `text-xs`) vinculadas a la variable CSS `--font-scale`, garantizando que un ajuste en la escala de tamaño de fuente (`SMALL` 0.9, `MEDIUM` 1.0, `LARGE` 1.15) aumente o reduzca proporcionalmente toda la interfaz de forma sincronizada y legible.

#### Scenario: Modificación del tamaño de tipografía en personalización
- **WHEN** el usuario selecciona el nivel de tamaño de fuente "Grande" (`LARGE`) o "Pequeño" (`SMALL`) en la sección de personalización
- **THEN** el sistema actualiza la variable `--font-scale` en `:root` y todos los textos, cabeceras, tablas, formularios y botones recalculan su tamaño automáticamente en tiempo real sin desbordamientos visuales

### Requirement: Escala de Redondeces Dinámica Gobernada por `--radius-scale`
Todos los contenedores, modales, tarjetas, inputs, botones y badges SHALL utilizar las clases de radio estándar (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`) mapeadas mediante variables CSS que multipliquen por `--radius-scale`, quedando prohibido el uso de valores de radio estáticos en píxeles que ignoren dicha variable.

#### Scenario: Cambio de estilo de bordes a Recto o Muy Redondeado
- **WHEN** el usuario conmuta la opción de radio a "Recto" (`0.0`) o "Muy Redondeado" (`2.0`)
- **THEN** todas las tarjetas, modales, campos de formulario, botones y menús flotantes adoptan la curvatura angular o redondeada correspondiente de forma homogénea en toda la aplicación
