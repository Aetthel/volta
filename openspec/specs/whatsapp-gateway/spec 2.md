# whatsapp-gateway Specification

## Purpose
Proporciona la capa de gateway para gestionar sesiones de WhatsApp por WebSocket, generación de QR para vinculación y emisión de eventos webhook en tiempo real.

## Requirements

### Requirement: Session Lifecycle and QR Authentication
The system SHALL provide endpoints or procedures to initiate, pair, maintain, and terminate WhatsApp connection sessions without requiring a headless browser.

#### Scenario: Generate QR code for pairing
- **WHEN** the backend requests the creation or connection of a new WhatsApp session
- **THEN** the gateway returns an active QR code (as base64 / raw string) and begins listening for authentication state changes

#### Scenario: Automatic session reconnection
- **WHEN** an authenticated WhatsApp session loses network connection or restarts
- **THEN** the gateway automatically attempts reconnection using stored session keys without prompting for a new QR scan

#### Scenario: Disconnect and clean session
- **WHEN** an explicit logout or disconnect request is sent for an instance
- **THEN** the gateway terminates the WebSocket connection and purges the local session credentials

### Requirement: Webhook Event Dispatching
The system SHALL dispatch real-time events to configured application endpoints upon message reception, delivery updates, and connection status changes.

#### Scenario: Incoming message webhook delivery
- **WHEN** a new message arrives from any WhatsApp contact or group
- **THEN** the gateway delivers an HTTP POST webhook payload containing the sender ID, message content, timestamp, and message type

#### Scenario: Connection status change notification
- **WHEN** an instance changes status (connecting, connected, disconnected, expired QR)
- **THEN** the gateway emits an event notifying the backend of the new status
