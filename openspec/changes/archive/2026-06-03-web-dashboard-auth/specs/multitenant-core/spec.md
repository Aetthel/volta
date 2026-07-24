## MODIFIED Requirements

### Requirement: Business Entity Definition

The system SHALL maintain a `Business` entity that serves as the root for all tenant-specific data, now including authentication credentials and role management.

#### Scenario: Registering a new business

- **WHEN** a new Business record is created in the database
- **THEN** it MUST include a unique ID, a name, a primary contact phone number, a unique email, a hashed password, and a role (`ADMIN` or `BUSINESS`).

### Requirement: Multi-tenant Data Isolation

All appointments and configurations SHALL be explicitly linked to a specific `Business` ID to ensure data isolation.

#### Scenario: Querying appointments for a business

- **WHEN** the system fetches appointments or settings for Business "A"
- **THEN** it MUST NOT return any data belonging to Business "B"
