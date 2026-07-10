## MODIFIED Requirements

### Requirement: Integración de PageHeader en layouts de vistas
El sistema SHALL unificar la estructura de cabecera de página en las vistas principales (`/clientes`, `/sedes`, `/ajustes`, `/admin`, `/inicio`, `/agenda`) utilizando el componente `PageHeader` para garantizar consistencia visual en la tipografía y alineación.

#### Scenario: Cabecera limpia sin tarjeta en el inicio
- **WHEN** el usuario carga la vista `/inicio`
- **THEN** el sistema renderiza el saludo personalizado mediante `PageHeader` directamente en el flujo del canvas sin contenedores de tarjetas, bordes ni fondos adicionales.

#### Scenario: Cabecera de página en agenda
- **WHEN** el usuario carga la vista de la agenda en `/agenda`
- **THEN** el sistema renderiza el componente `PageHeader` de manera compacta, alineando la cabecera con los controles de navegación del calendario.
