## MODIFIED Requirements

### Requirement: Appointment Data Model

The system SHALL maintain `Appointment` records containing client name, client phone (international format), appointment date/time, and status. When automatically creating a new client during appointment creation, the system SHALL set `lastVisit` to a valid `DateTime` instance.

#### Scenario: Validating appointment fields
- **WHEN** an Appointment record is saved
- **THEN** it MUST include clientName, clientPhone, appointmentDate, and businessId

#### Scenario: Auto-registering client on appointment creation
- **WHEN** an appointment is scheduled for a client not existing in the business database
- **THEN** the system MUST create a new `Client` record with `lastVisit` set to a valid `DateTime` object matching current time
