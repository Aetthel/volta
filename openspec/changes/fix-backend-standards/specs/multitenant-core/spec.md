## MODIFIED Requirements

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
