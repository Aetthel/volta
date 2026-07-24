## ADDED Requirements

### Requirement: Espaciado fluido en componentes reutilizables

El sistema SHALL estructurar los componentes de interfaz reutilizables (`Card`, `Sidebar`, `BottomNav`, `Header`, etc.) de forma que sus márgenes, rellenos y espacios de separación internos consuman de manera dinámica la variable de espaciado fluido `--spacing-gutter` (`gutter`).

#### Scenario: Relleno fluido en tarjetas

- **WHEN** un contenedor o tarjeta utiliza padding de espaciado (ej. `p-gutter` o `p-margin-mobile md:p-gutter`)
- **THEN** el espaciado efectivo se calcula dinámicamente según el viewport (`clamp(1rem, 0.75rem + 1.25vw, 1.5rem)`), adaptándose de forma continua a móviles, tablets y ordenadores.
