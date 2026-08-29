## ADDED Requirements

### Requirement: Desacoplamiento Modular del Panel de Equipo
El panel de administración de equipo SHALL gestionar la consulta, búsqueda y mutación de trabajadores mediante un hook especializado (`useTeamList`) y componentes modulares en `frontend/components/team/`.

#### Scenario: Filtrado y edición de roles de trabajadores
- **WHEN** un administrador busca trabajadores o filtra por rol (ADMIN, JEFE, EMPLEADO)
- **THEN** la lógica de filtrado normalizado se ejecuta mediante el hook modular y la tabla se actualiza inmediatamente
