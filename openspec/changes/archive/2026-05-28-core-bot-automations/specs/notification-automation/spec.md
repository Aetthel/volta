## ADDED Requirements

### Requirement: Scheduled Automation Trigger

The system SHALL run a "Sentinel" process every night at 20:00h using `node-cron`.

#### Scenario: Daily trigger

- **WHEN** the clock reaches 20:00:00 local time
- **THEN** the system MUST initiate the appointment scanning process

### Requirement: Next-Day Appointment Filtering

The system SHALL scan the database for all appointments in `PENDING` status scheduled for the following calendar day.

#### Scenario: Filtering for tomorrow's appointments

- **WHEN** the Sentinel runs on May 27th
- **THEN** it MUST only select appointments where `appointmentDate` falls on May 28th and status is `PENDING`

### Requirement: Personalized WhatsApp Notification

The system SHALL send a message via the linked WhatsApp account using the template: "Hello [Name], reminder of your appointment tomorrow at [Time] at [Business Name]."

#### Scenario: Successful message dispatch

- **WHEN** a notification is sent successfully via whatsapp-web.js
- **THEN** the Appointment status MUST be updated to `SENT`

### Requirement: Anti-Ban Message Pacing

The system SHALL wait for a random interval between 30 and 60 seconds between sending consecutive messages.

#### Scenario: Safety delay between messages

- **WHEN** sending multiple notifications in a single run
- **THEN** the system MUST wait at least 30 seconds after the completion of one send before starting the next

### Requirement: Error Handling and Status Update

If a message fails to send, the system SHALL update the appointment status to `ERROR`.

#### Scenario: Failed message dispatch

- **WHEN** whatsapp-web.js encounters an error (e.g., invalid number or timeout) during sending
- **THEN** the Appointment status MUST be changed to `ERROR`
