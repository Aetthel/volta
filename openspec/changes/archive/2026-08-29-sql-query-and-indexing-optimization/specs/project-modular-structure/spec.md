## ADDED Requirements

### Requirement: Indexación Compuesta y Eficiencia en Consultas SQL
Todas las consultas de lectura y filtrado sobre entidades multitenant SHALL ejecutarse mediante índices de base de datos compuestos que incluyan `businessId` y el campo de filtro o clasificación correspondiente (`appointmentDate`, `phone`, `email`, `status`).

#### Scenario: Consulta de citas por rango de fechas
- **WHEN** el backend consulta citas de un negocio para un día o semana específica
- **THEN** PostgreSQL utiliza el índice compuesto `(businessId, appointmentDate)` realizando un Index Scan sin incurrir en lecturas secuenciales de tabla
