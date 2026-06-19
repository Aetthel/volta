# business-settings Specification

## Purpose
TBD - created by archiving change web-dashboard-auth. Update Purpose after archive.
## Requirements
### Requirement: Customizable Message Templates
The system SHALL allow a `BUSINESS` user to define and update their own message templates for "Welcome/Booking" and "Reminder" notifications.

#### Scenario: Business updates templates
- **WHEN** a Business user submits the settings form with new message text
- **THEN** the system updates their business configuration in the database and uses the new text for future messages

### Requirement: Template Variables
The system SHALL support dynamic variables in templates (e.g., `{{clientName}}`, `{{appointmentDate}}`) which are automatically replaced during message sending.

#### Scenario: Sending message with variables
- **WHEN** a message is sent using a template containing `{{clientName}}`
- **THEN** the system replaces the placeholder with the actual name of the client before delivery

### Requirement: Operating Hours Management
The system SHALL allow a `BUSINESS` user to update their weekly operating hours. The database transaction updating these hours MUST perform updates or upserts matching `dayOfWeek` to maintain stable primary key UUIDs for the `BusinessHours` records, avoiding delete-and-recreate operations.

#### Scenario: Updating operating hours
- **WHEN** a Business user saves their weekly operating hours schedule
- **THEN** the system updates the records using upsert operations based on dayOfWeek, preserving existing UUID keys

