# Capability: WhatsApp Integration

## Purpose
TBD - This capability manages WhatsApp sessions and communication using whatsapp-web.js.

## Requirements

### Requirement: Multi-instance WhatsApp Management
The system SHALL support multiple concurrent WhatsApp sessions, indexed by the `Business` ID.

#### Scenario: Starting a session for a specific business
- **WHEN** the system initializes the bot for a business ID
- **THEN** it MUST use a dedicated session directory (LocalAuth) for that specific ID

### Requirement: QR Code Authentication
The system SHALL support generating a visual QR code for initial authentication, allowing users to scan and pair their WhatsApp accounts from both the Settings and Dashboard panels, and SHALL also output the WhatsApp QR code to the terminal.

#### Scenario: Authenticating a new business
- **WHEN** a business without a saved session starts the bot
- **THEN** the system MUST generate and print the QR code string to the console

#### Scenario: Authenticating a new business via Settings
- **WHEN** a business without an active session views the WhatsApp Bot settings page
- **THEN** the system MUST render a valid QR code image dynamically using the pairing string

#### Scenario: Authenticating a new business via Dashboard
- **WHEN** a business without an active session views the dashboard main page in WAITING_QR status
- **THEN** the system MUST display a valid, scanable QR code image using the pairing string

### Requirement: Persistent Local Authentication
The system SHALL persist WhatsApp sessions to disk using `LocalAuth` to avoid re-authentication on every restart.

#### Scenario: Re-initializing an existing session
- **WHEN** the bot restarts and a session already exists for a business ID
- **THEN** the bot MUST automatically reconnect without requiring a new QR code

### Requirement: Ensure WhatsApp client is ready before sending notifications
The backend bot routines must await the full initialization of the Puppeteer WhatsApp client before triggering message sends, avoiding evaluate/simulation errors on startup.

#### Scenario: Sending welcome messages or sentinel reminders
- **WHEN** a welcome message or sentinel reminder is triggered
- **THEN** the bot calls `waitForReady()` to ensure the WhatsApp client is connected and active before calling `sendMessage()`.

### Requirement: Memory-Leak-Free Event Listener Cleanup
The WhatsApp client initialization helper MUST clean up all temporary event listeners (including ready, qr, auth_failure, and disconnected) registered during the wait-for-ready phase once the client is either ready or throws an initialization error.

#### Scenario: WhatsApp client successfully connects
- **WHEN** the WhatsApp client fires the ready event during initialization
- **THEN** all other pending initialization event listeners (qr, auth_failure, disconnected) MUST be detached to prevent memory leaks

### Requirement: Fail-Fast Check for Disconnected WhatsApp Sessions
The automated message sentinel MUST verify the current database connection state of the business's WhatsApp link before attempting to wait for Puppeteer initialization, failing immediately on disconnected accounts.

#### Scenario: Sentinel processes appointment for disconnected WhatsApp account
- **WHEN** the Sentinel daily scan processes an appointment for a business whose WhatsApp status in the database is WAITING_QR or DISCONNECTED
- **THEN** it MUST skip the appointment notification immediately and mark it as skipped or failed without waiting for the 45-second Puppeteer timeout
