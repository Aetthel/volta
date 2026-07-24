## ADDED Requirements

### Requirement: Business Entity Definition

The system SHALL maintain a `Business` entity that serves as the root for all tenant-specific data.

#### Scenario: Registering a new business

- **WHEN** a new Business record is created in the database
- **THEN** it MUST include a unique ID, a name, and a primary contact phone number

### Requirement: Multi-tenant Data Isolation

All appointments SHALL be explicitly linked to a specific `Business` ID to ensure data isolation.

#### Scenario: Querying appointments for a business

- **WHEN** the system fetches appointments for Business "A"
- **THEN** it MUST NOT return any appointments belonging to Business "B"
