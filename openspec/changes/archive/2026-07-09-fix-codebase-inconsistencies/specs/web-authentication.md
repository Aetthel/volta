## ADDED Requirements

### Requirement: Client-side Page Authorization for Administrative Routes

The dashboard application must check user roles before rendering administrative pages to prevent unauthorized access.

#### Scenario: Non-admin user tries to access /admin or /sedes

- **WHEN** a logged-in user with role EMPLEADO or JEFE navigates to `/admin` or `/sedes`
- **THEN** the page displays a custom "Acceso Denegado" message instead of empty dashboards or infinite loading indicators.
