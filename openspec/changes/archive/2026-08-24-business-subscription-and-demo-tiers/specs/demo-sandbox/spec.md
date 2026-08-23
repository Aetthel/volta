# Capability Spec: Demo Sandbox

## Requirement: Ephemeral Demo Sandbox

The system SHALL provide an instant, unauthenticated 20-minute sandbox demo session for prospective users to explore Volta features without registration.

### Scenario: Visitor launches Sandbox Demo

- **WHEN** a visitor clicks "Probar Demo Instantánea" on the landing page
- **THEN** the system SHALL create an ephemeral Business session with `subscriptionStatus = 'DEMO_SANDBOX'`
- **AND** the session SHALL be populated with sample demo data (services, appointments, clients)
- **AND** the sandbox session SHALL automatically expire 20 minutes after creation
- **AND** after expiration, the system SHALL prompt the user to register for a 14-day free trial.
