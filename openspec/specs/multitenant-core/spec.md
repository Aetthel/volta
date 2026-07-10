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
All appointments, configurations, and user lists SHALL be explicitly linked and isolated by `Business` ID. The Next.js API proxy and backend endpoints MUST validate that any requested `businessId` query or body parameter matches the authenticated user's `session.user.businessId` to prevent unauthorized cross-tenant data requests. Non-admin users MUST NOT be able to list users or clients from other businesses.

#### Scenario: Querying appointments for a business
- **WHEN** the system fetches appointments or settings for Business "A"
- **THEN** it MUST NOT return any data belonging to Business "B"

#### Scenario: Cross-tenant API proxy validation
- **WHEN** a user of Business "A" makes an API request specifying `businessId` of Business "B" in path, query, or body
- **THEN** the Next.js API proxy MUST reject the request with a 403 Forbidden error

#### Scenario: Querying user list for non-admin
- **WHEN** a non-admin user of Business "A" requests the user list
- **THEN** the system MUST filter the results to only return users belonging to Business "A"

### Requirement: Enforce server-side tenant validation for appointments, services, and whatsapp gateways
All core backend endpoints handling business-specific data must validate that the logged-in user belongs to the requested business, preventing cross-tenant data access.

#### Scenario: Querying appointments from another business
- **WHEN** a logged-in user with role EMPLEADO or JEFE fetches appointments using a different businessId in the query parameters
- **THEN** the server returns a 403 Forbidden response.

#### Scenario: Creating appointments for another business
- **WHEN** a logged-in user with role EMPLEADO or JEFE submits a POST request to create an appointment with a mismatching businessId in the request body
- **THEN** the server returns a 403 Forbidden response.

#### Scenario: Reading, updating or deleting services of another business
- **WHEN** a logged-in user with role EMPLEADO or JEFE accesses services of a different business via GET, POST, PUT, or DELETE requests
- **THEN** the server returns a 403 Forbidden response.

#### Scenario: Controlling WhatsApp client of another business
- **WHEN** a logged-in user attempts to initialize, disconnect, read templates, or save templates for another business ID
- **THEN** the server returns a 403 Forbidden response.
