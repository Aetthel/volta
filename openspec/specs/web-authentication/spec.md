# web-authentication Specification

## Purpose
TBD - created by archiving change web-dashboard-auth. Update Purpose after archive.
## Requirements
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

### Requirement: Secure Password Management
The system SHALL ensure that all user passwords are encrypted using a strong hashing algorithm (e.g., bcrypt) before being stored in the database.

#### Scenario: Password Storage
- **WHEN** an administrator creates a new business account with a password
- **THEN** the system stores the hashed version of the password in the database

### Requirement: Centered Minimalist SaaS Login Layout
The login interface SHALL render as a flat, single-column centered layout directly on the viewport background, without any surrounding container card, borders, or shadows. It SHALL display the brand logo icon, page header title ("Iniciar Sesión"), inputs using inline placeholders ("Correo electrónico" and "Contraseña") instead of separate text labels above them (with a show/hide password visibility toggle), a primary "Iniciar Sesión" button, links for resetting password, a secondary outline button for creating a new account, and a small disclaimer footer at the bottom.

#### Scenario: Form alignment on different resolutions
- **WHEN** the login page is loaded on any viewport (mobile, tablet, or desktop)
- **THEN** the login form elements are vertically and horizontally centered on the viewport in a flat, borderless structure

### Requirement: Client-side Page Authorization for Administrative Routes
The dashboard application MUST check user roles before rendering administrative pages to prevent unauthorized access.

#### Scenario: Non-admin user tries to access /admin or /sedes
- **WHEN** a logged-in user with role EMPLEADO or JEFE navigates to `/admin` or `/sedes`
- **THEN** the page displays a custom "Acceso Denegado" message instead of empty dashboards or infinite loading indicators.

### Requirement: Cryptographic Verification of Authentication Context
The backend API SHALL authenticate the Next.js proxy requests using a cryptographically signed token (JWT) containing the user session role and business ID.

#### Scenario: Request contains valid signed JWT
- **WHEN** the proxy sends a request with a valid JWT signed by the shared secret `BACKEND_JWT_SECRET`
- **THEN** the backend decodes the token, sets the `req.user` context, and permits downstream processing

#### Scenario: Request contains invalid or unsigned token
- **WHEN** the proxy or an attacker sends a request with an unsigned, expired, or improperly signed token
- **THEN** the backend rejects the request with a 401 Unauthorized status

### Requirement: Server-side Role Authorization
The backend SHALL enforce strict role checks on admin endpoints to verify that the requesting user's decoded role is `ADMIN`.

#### Scenario: Non-admin role tries to access admin routes
- **WHEN** a user with role `EMPLEADO` or `JEFE` attempts to access any route under `/api/admin`
- **THEN** the backend rejects the request with a 403 Forbidden status

