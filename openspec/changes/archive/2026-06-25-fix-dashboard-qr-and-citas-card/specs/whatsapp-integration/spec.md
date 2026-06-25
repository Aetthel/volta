## MODIFIED Requirements

### Requirement: QR Code Authentication
The system SHALL support generating a visual QR code for initial authentication, allowing users to scan and pair their WhatsApp accounts from both the Settings and Dashboard panels.

#### Scenario: Authenticating a new business via Settings
- **WHEN** a business without an active session views the WhatsApp Bot settings page
- **THEN** the system MUST render a valid QR code image dynamically using the pairing string

#### Scenario: Authenticating a new business via Dashboard
- **WHEN** a business without an active session views the dashboard main page in WAITING_QR status
- **THEN** the system MUST display a valid, scanable QR code image using the pairing string
