## MODIFIED Requirements

### Requirement: Multi-role Authentication

The system SHALL provide a secure login interface and routing proxy that supports distinct roles including `ADMIN`, `JEFE`, and `EMPLEADO`, and resolves user roles correctly in both API and middleware contexts.

#### Scenario: Successful Admin Login

- **WHEN** a user with the `ADMIN` role enters valid credentials
- **THEN** the system redirects them to the Admin Dashboard (`/admin`)

#### Scenario: Successful Business Login

- **WHEN** a user with the `JEFE` or `EMPLEADO` role enters valid credentials
- **THEN** the system redirects them to their Business Dashboard (`/inicio`)

#### Scenario: Unauthorized Access Attempt

- **WHEN** an unauthenticated user tries to access protected routes
- **THEN** the system redirects them to the login page
