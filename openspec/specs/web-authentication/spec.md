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

