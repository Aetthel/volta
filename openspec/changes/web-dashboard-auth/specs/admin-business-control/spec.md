## ADDED Requirements

### Requirement: Business Account Creation
The system SHALL provide an interface for the `ADMIN` to create new business accounts by providing a name, email, and initial password.

#### Scenario: Admin creates a new business
- **WHEN** the Admin submits the business creation form with valid data
- **THEN** a new `Business` record is created in the database and the Admin is notified of success

### Requirement: Business List Management
The system SHALL allow the `ADMIN` to view a list of all registered businesses and their current status.

#### Scenario: Admin views business list
- **WHEN** the Admin accesses the Business Management page
- **THEN** the system displays a list of all businesses including their name, email, and connection status
