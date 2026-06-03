# Capability: Appointment Management

## Purpose
TBD - This capability handles appointment data, tracking, and API access.
## Requirements
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

### Requirement: Visual Agenda View
The system SHALL provide a clear and intuitive view (calendar or list) of all appointments for the logged-in business.

#### Scenario: Business views today's agenda
- **WHEN** a Business user accesses the main dashboard
- **THEN** the system displays all appointments for the current day, sorted by time

### Requirement: Quick Appointment Creation Form
The system SHALL provide a minimal form to schedule a new appointment with the least amount of friction (Mobile-first UX).

#### Scenario: Business schedules a new client
- **WHEN** the user opens the "Quick Add" form and enters name, phone, and date/time
- **THEN** the system creates the appointment and triggers the instant WhatsApp confirmation (if configured)

### Requirement: Simple Appointment Cancellation
The system SHALL allow the business to quickly cancel an appointment from the agenda view.

#### Scenario: Business cancels an appointment
- **WHEN** the user clicks "Cancel" on an existing appointment
- **THEN** the system marks it as cancelled and removes it from the active agenda

