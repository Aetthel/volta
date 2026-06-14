## ADDED Requirements

### Requirement: Initialize WhatsApp Gateway Session
The backend SHALL expose an endpoint to initialize a WhatsApp-Web session for a business using Puppeteer and LocalAuth, updating the business's WhatsApp status to `WAITING_QR` when the QR code is generated.

#### Scenario: User requests connection and QR is generated
- **WHEN** user posts to `/api/whatsapp/init` with `businessId`
- **THEN** the backend initializes Puppeteer, generates a QR code, saves it to the database, and updates the status to `WAITING_QR`

### Requirement: Poll Connection Status and QR Code
The backend SHALL expose an endpoint to query the connection status and get the active QR code for a given business.

#### Scenario: Frontend polls connection status
- **WHEN** frontend calls `/api/whatsapp/status` with `businessId`
- **THEN** the backend returns the current `whatsappStatus` and `qrCode` from the database

### Requirement: Disconnect WhatsApp Session
The backend SHALL expose an endpoint to destroy the WhatsApp session and log out the client, setting the database status to `DISCONNECTED`.

#### Scenario: User disconnects WhatsApp account
- **WHEN** user posts to `/api/whatsapp/disconnect` with `businessId`
- **THEN** the backend destroys the client instance and updates `whatsappStatus` to `DISCONNECTED`
