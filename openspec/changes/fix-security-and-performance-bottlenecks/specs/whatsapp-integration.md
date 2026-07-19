## ADDED Requirements

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
