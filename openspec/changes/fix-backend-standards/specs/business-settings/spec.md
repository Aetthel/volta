## ADDED Requirements

### Requirement: Operating Hours Management
The system SHALL allow a `BUSINESS` user to update their weekly operating hours. The database transaction updating these hours MUST perform updates or upserts matching `dayOfWeek` to maintain stable primary key UUIDs for the `BusinessHours` records, avoiding delete-and-recreate operations.

#### Scenario: Updating operating hours
- **WHEN** a Business user saves their weekly operating hours schedule
- **THEN** the system updates the records using upsert operations based on dayOfWeek, preserving existing UUID keys
