## ADDED Requirements

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
