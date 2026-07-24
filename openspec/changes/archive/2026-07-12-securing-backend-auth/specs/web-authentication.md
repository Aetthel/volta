## ADDED Requirements

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
