# web-authentication Specification

## Purpose
TBD - created by archiving change web-dashboard-auth. Update Purpose after archive.
## Requirements
### Requirement: Multi-role Authentication
The system SHALL provide a secure login interface that supports two distinct roles: `ADMIN` and `BUSINESS`.

#### Scenario: Successful Admin Login
- **WHEN** a user with the `ADMIN` role enters valid credentials
- **THEN** the system redirects them to the Admin Dashboard (`/admin`)

#### Scenario: Successful Business Login
- **WHEN** a user with the `BUSINESS` role enters valid credentials
- **THEN** the system redirects them to their Business Dashboard (`/dashboard`)

#### Scenario: Unauthorized Access Attempt
- **WHEN** an unauthenticated user tries to access protected routes (`/admin` or `/dashboard`)
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


