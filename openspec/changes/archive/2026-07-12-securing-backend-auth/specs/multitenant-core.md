## ADDED Requirements

### Requirement: Token-based Tenant Isolation

All tenant-scoped queries and data mutations on the backend SHALL extract the target `businessId` directly from the cryptographically verified JWT instead of trusting unchecked HTTP headers.

#### Scenario: Business ID mismatch in request parameters

- **WHEN** a non-admin user requests resources (appointments, clients, services, whatsapp) and the requested `businessId` (in path, query, or body) does not match the `businessId` decoded from the verified JWT
- **THEN** the backend rejects the request with a 403 Forbidden status
