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
