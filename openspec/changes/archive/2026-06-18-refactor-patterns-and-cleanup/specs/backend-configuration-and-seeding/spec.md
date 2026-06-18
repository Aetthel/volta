## ADDED Requirements

### Requirement: Environment Variable Validation
The backend SHALL validate that all required environment variables are present on startup.

#### Scenario: Missing required database configuration
- **WHEN** the backend is started without the `DATABASE_URL` environment variable
- **THEN** the system MUST print a fatal error message and exit the process.

#### Scenario: Missing required API key
- **WHEN** the backend is started without the `API_KEY` environment variable
- **THEN** the system MUST print a fatal error message and exit the process.

### Requirement: Centralized Configuration Loading
The backend SHALL centralize the environment variable loading, parsing, and defaults in a single config module.

#### Scenario: Requesting port number
- **WHEN** the application requests the port number from configuration
- **THEN** the config module MUST return either the value of `BACKEND_PORT`, `PORT` (excluding 3000), or a default of 3001.

### Requirement: Automatic Development Database Seeding
The backend SHALL verify and seed core mock data (admin user, mock business, sample clients/appointments) on startup during development.

#### Scenario: Verification of default users and business
- **WHEN** the backend initializes the database
- **THEN** the system MUST upsert mock admin (`admin@test.com`), jefe (`jefe@test.com`), and employee (`empleado@test.com`) records.
