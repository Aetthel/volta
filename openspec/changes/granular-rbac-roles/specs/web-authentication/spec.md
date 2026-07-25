# Web Authentication & RBAC Delta Spec

## Modifies: web-authentication

### Requirement: Role-Based Route Protection (Frontend)
The system SHALL restrict frontend route navigation based on user role:
- Users with role `EMPLEADO` SHALL only be permitted to access `/inicio`, `/clientes`, and `/agenda`. Attempting to navigate to `/ajustes` SHALL redirect them to `/inicio`.
- Users with role `JEFE` SHALL be permitted to access `/inicio`, `/clientes`, `/agenda`, and `/ajustes`. Attempting to navigate to `/admin` or `/sedes` SHALL redirect them to `/inicio`.
- Navigation components (Sidebar) SHALL dynamically filter and hide menu links that the user's role is not authorized to access.

### Requirement: Role-Based API Authorization (Backend)
The backend API SHALL enforce role authorization middleware (`requireRole`) on sensitive endpoints:
- Endpoints modifying WhatsApp pairing (`/api/whatsapp/*`), business configuration (`PUT /api/business`), and user account management (`/api/users/*`) SHALL require `JEFE` or `ADMIN` role and reject `EMPLEADO` requests with `403 Forbidden`.
