## MODIFIED Requirements

### Requirement: Vista de Agenda Dedicada

El sistema SHALL proveer una página dedicada exclusivamente a la visualización tridimensional o en rejilla horaria del calendario semanal y diario bajo la ruta `/agenda`.

#### Scenario: Visualización del calendario completo

- **WHEN** el usuario accede a la ruta `/agenda`
- **THEN** el sistema renderiza la rejilla horaria de citas (semanal o diaria) con soporte para clic derecho, menús contextuales y guías flotantes, aprovechando todo el ancho de la pantalla sin solapamiento de paneles informativos, aplicando un posicionamiento dinámico de citas solapadas con solape visual tridimensional y expansión horizontal inteligente, tarjetas con indicador de color en barra lateral y distribución en una línea para citas cortas.
