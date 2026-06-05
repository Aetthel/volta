## MODIFIED Requirements

### Requirement: Business Entity Definition
The system SHALL maintain a `Business` entity that serves as the root for all tenant-specific data, including authentication credentials and role management. The database schema and ORM logic SHALL be located within the backend workspace to serve as the single source of truth.

#### Scenario: Registering a new business
- **WHEN** a new Business record is created in the database
- **THEN** it MUST include a unique ID, a name, a primary contact phone number, a unique email, a hashed password, and a role (`ADMIN` or `BUSINESS`).
- **THEN** both the frontend and backend applications MUST be able to query this data via the shared backend ORM client.