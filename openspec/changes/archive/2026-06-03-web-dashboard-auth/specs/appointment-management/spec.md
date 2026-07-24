## ADDED Requirements

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
