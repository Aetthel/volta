# Capability: Multi-tenant Core

## Purpose
TBD - This capability handles multi-tenancy and data isolation for different businesses.
## Requirements
### Requirement: Business Entity Definition
The system SHALL maintain a `Business` entity that serves as the root for all tenant-specific data, including authentication credentials and role management. The database schema and ORM logic SHALL be located within the backend workspace to serve as the single source of truth.

#### Scenario: Registering a new business
- **WHEN** a new Business record is created in the database
- **THEN** it MUST include a unique ID, a name, a primary contact phone number, a unique email, a hashed password, and a role (`ADMIN` or `BUSINESS`).
- **THEN** both the frontend and backend applications MUST be able to query this data via the shared backend ORM client.

### Requirement: Multi-tenant Data Isolation
All appointments and configurations SHALL be explicitly linked to a specific `Business` ID to ensure data isolation.

#### Scenario: Querying appointments for a business
- **WHEN** the system fetches appointments or settings for Business "A"
- **THEN** it MUST NOT return any data belonging to Business "B"

