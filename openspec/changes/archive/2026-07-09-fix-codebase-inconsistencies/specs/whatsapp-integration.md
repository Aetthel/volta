## ADDED Requirements

### Requirement: Ensure WhatsApp client is ready before sending notifications

The backend bot routines must await the full initialization of the Puppeteer WhatsApp client before triggering message sends, avoiding evaluate/simulation errors on startup.

#### Scenario: Sending welcome messages or sentinel reminders
- **WHEN** a welcome message or sentinel reminder is triggered
- **THEN** the bot calls `waitForReady()` to ensure the WhatsApp client is connected and active before calling `sendMessage()`.
