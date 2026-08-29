## ADDED Requirements

### Requirement: Descomposición Modular de la Gestión de Clientes
El panel de clientes SHALL desacoplar la lógica de filtrado, paginación y mutaciones en un custom hook reutilizable (`useClientsList`), organizando la presentación en componentes especializados dentro de `frontend/components/clients/`.

#### Scenario: Visualización y filtrado de clientes
- **WHEN** un usuario busca un cliente o filtra por estado LOPD
- **THEN** la lógica de filtrado normalizado se ejecuta mediante el hook modular, y la tabla de clientes se actualiza sin recargar el componente de página
