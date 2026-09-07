## MODIFIED Requirements

### Requirement: Appointment Data Model

The system SHALL maintain `Appointment` records containing client name, client phone (international format), appointment date/time, and status. When automatically creating a new client during appointment creation, the system SHALL set `lastVisit` to a valid `DateTime` instance.

A client's phone number SHALL be unique within a business: the pair `(businessId, phone)` identifies at most one `Client`. Client phone numbers SHALL be reduced to a single canonical form before being compared or stored, consistently across every write path, and the automatic client creation during appointment creation SHALL be idempotent on that pair, so that concurrent appointments for the same phone number resolve to a single `Client` record.

#### Scenario: Validating appointment fields

- **WHEN** an Appointment record is saved
- **THEN** it MUST include clientName, clientPhone, appointmentDate, and businessId

#### Scenario: Auto-registering client on appointment creation

- **WHEN** an appointment is scheduled for a client not existing in the business database
- **THEN** the system MUST create a new `Client` record with `lastVisit` set to a valid `DateTime` object matching current time

#### Scenario: Concurrent appointments for the same phone number

- **WHEN** two appointments for the same unregistered phone number of the same business are created concurrently
- **THEN** the system MUST end up with exactly one `Client` record for that phone number, with both appointments linked to it

#### Scenario: Rejecting a duplicate client phone number

- **WHEN** an attempt is made to store a second `Client` with a phone number already used within the same business
- **THEN** the system MUST reject the write and reuse the existing `Client` instead
