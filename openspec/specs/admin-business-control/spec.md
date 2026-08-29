# admin-business-control Specification

## Purpose

TBD - created by archiving change web-dashboard-auth. Update Purpose after archive.

## Requirements

### Requirement: Business Account Creation

The system SHALL provide an interface for the `ADMIN` to create new business accounts by providing a name, email, and initial password.

#### Scenario: Admin creates a new business

- **WHEN** the Admin submits the business creation form with valid data
- **THEN** a new `Business` record is created in the database and the Admin is notified of success

### Requirement: Business List Management

The system SHALL allow the `ADMIN` to view a list of all registered businesses and their current status.

#### Scenario: Admin views business list

- **WHEN** the Admin accesses the Business Management page
- **THEN** the system displays a list of all businesses including their name, email, and connection status

### Requirement: Admin Dashboard Metrics

The system SHALL calculate dashboard metrics dynamically using the actual services and prices recorded in the database. Calculated metrics MUST reflect the specific services and prices of the appointments rather than hardcoded static price maps or default client preferences.

#### Scenario: Displaying admin metrics

- **WHEN** the Admin views the dashboard stats
- **THEN** the system calculates estimated income and average tickets based on actual appointment service names and dynamic database prices

### Requirement: Desacoplamiento Modular del Panel de Equipo
El panel de administración de equipo SHALL gestionar la consulta, búsqueda y mutación de trabajadores mediante un hook especializado (`useTeamList`) y componentes modulares en `frontend/components/team/`.

#### Scenario: Filtrado y edición de roles de trabajadores
- **WHEN** un administrador busca trabajadores o filtra por rol (ADMIN, JEFE, EMPLEADO)
- **THEN** la lógica de filtrado normalizado se ejecuta mediante el hook modular y la tabla se actualiza inmediatamente

### Requirement: Modularización de Gestión Multi-Sede
El panel de administración multi-sede SHALL organizar la visualización, creación y gestión de trabajadores por sede a través del hook `useLocationsList` y componentes modulares bajo `frontend/components/sedes/`.

#### Scenario: Creación de sede y gestión de trabajadores
- **WHEN** un administrador añade una nueva sede o gestiona los trabajadores adscritos a un establecimiento
- **THEN** las operaciones se canalizan a través de `apiClient` y los modales modulares gestionan su estado de forma autónoma
