## ADDED Requirements

### Requirement: Appointment Data Model
The system SHALL maintain `Appointment` records containing client name, client phone (international format), appointment date/time, and status.

#### Scenario: Validating appointment fields
- **WHEN** an Appointment record is saved
- **THEN** it MUST include clientName, clientPhone, appointmentDate, and businessId

### Requirement: Appointment Status Tracking
Each appointment SHALL have one of three states: `PENDING`, `SENT`, or `ERROR`.

#### Scenario: Initializing new appointments
- **WHEN** a new appointment is inserted via API
- **THEN** its status MUST default to `PENDING`

### Requirement: Secure Appointment Insertion API
The system SHALL provide a `POST /api/appointments` endpoint protected by a static API Key.

#### Scenario: Successful appointment insertion
- **WHEN** a POST request is made to `/api/appointments` with a valid API Key and correct JSON body
- **THEN** the system MUST create a new Appointment record and return a 201 Created status

#### Scenario: Unauthorized API access
- **WHEN** a request is made to `/api/appointments` with an invalid or missing API Key
- **THEN** the system MUST return a 401 Unauthorized status
