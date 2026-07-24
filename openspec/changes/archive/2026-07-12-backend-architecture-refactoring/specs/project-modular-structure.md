## ADDED Requirements

### Requirement: Router-Controller-Service Architectural Pattern

The backend service SHALL structure its API logic using the Router-Controller-Service architectural pattern:

- **Router Layer:** Defines API paths, parameter validations, and authorization middlewares.
- **Controller Layer:** Translates HTTP inputs (body, query, parameters) to service inputs, invokes services, and formats HTTP responses.
- **Service Layer:** Performs pure database mutations and queries, independent of HTTP contexts, enabling isolated execution and testing.

#### Scenario: Registering a client through routes

- **WHEN** a client registration endpoint is requested
- **THEN** the router validates the schema, the controller maps the request, the service writes to the database and schedules welcome messaging, and the controller responds with a 201 Created status.
