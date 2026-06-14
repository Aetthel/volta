## ADDED Requirements

### Requirement: Retrieve Message Templates
The backend SHALL expose an endpoint to retrieve the current welcome and reminder message templates configured for a business.

#### Scenario: Fetching templates from database
- **WHEN** frontend calls `/api/whatsapp/templates` with `businessId`
- **THEN** the backend returns the `welcomeMessage` and `reminderMessage` values

### Requirement: Update Message Templates
The backend SHALL expose an endpoint to save changes to the welcome and reminder message templates.

#### Scenario: Updating template texts
- **WHEN** frontend posts to `/api/whatsapp/templates` with `businessId`, `welcomeMessage`, and `reminderMessage`
- **THEN** the backend updates the business record in the database with the new template texts
