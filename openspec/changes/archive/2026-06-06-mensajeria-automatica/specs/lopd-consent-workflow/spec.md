## ADDED Requirements

### Requirement: Block Automated Messages Without Consent

The system MUST NOT send automated booking confirmations or sentinel reminders to any client whose LOPD status is `Pendiente`.

#### Scenario: Sentinel scans appointments for tomorrow

- **WHEN** `runSentinel` runs and finds a pending appointment
- **THEN** the system checks the client's `lopdStatus` and skips sending the message if it is `Pendiente`

### Requirement: Automated LOPD Consent Request

When a new appointment is created, if the client's LOPD status is `Pendiente`, the system SHALL automatically send a WhatsApp message to the client containing a unique consent URL.

#### Scenario: Appointment created for new client

- **WHEN** user creates an appointment and the client's `lopdStatus` is `Pendiente`
- **THEN** the system sends a WhatsApp message with the link `http://localhost:3000/lopd/[clientId]` instead of the booking confirmation

### Requirement: Public LOPD Consent Page

The frontend SHALL provide a public, unauthenticated page at `/lopd/[id]` where clients can review policies and grant consent.

#### Scenario: Client accepts privacy policies

- **WHEN** client clicks "Aceptar y permitir recordatorios" on the page `/lopd/[id]`
- **THEN** the page sends a request to the public endpoint `/api/lopd/[id]/accept`

### Requirement: Retroactive Booking Confirmation Upon Consent

When a client grants consent, the system SHALL update their `lopdStatus` to `Aceptado` and immediately trigger the sending of the pending booking confirmation (welcome message) for any future appointments.

#### Scenario: Client transitions from Pendiente to Aceptado

- **WHEN** client accepts the consent on the public page
- **THEN** the backend updates the status to `Aceptado` and sends the booking confirmation for their future appointments
