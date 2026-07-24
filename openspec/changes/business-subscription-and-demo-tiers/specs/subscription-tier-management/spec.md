# Capability Spec: Subscription Tier Management

## Requirement: 14-Day Free Trial

The system SHALL grant a 14-day full Pro trial to all newly registered business accounts.

### Scenario: New business registration

- **WHEN** a user completes the `/register` wizard
- **THEN** the system SHALL set `subscriptionPlan = 'PRO'` and `subscriptionStatus = 'TRIAL'`
- **AND** the system SHALL calculate `trialExpiresAt = now() + 14 days`
- **AND** the business SHALL have unrestricted access to all Pro features during the trial.

## Requirement: Plan Limits & Enforcement

The system SHALL enforce feature limits based on the active plan (`BASE` vs `PRO`).

### Scenario: Plan Base user creates a second location

- **GIVEN** a business with `subscriptionPlan = 'BASE'` and 1 active location
- **WHEN** the user attempts to add a new location
- **THEN** the system SHALL reject the request with HTTP Status 403
- **AND** the system SHALL return a message prompting the user to upgrade to Plan Pro (25€/mes).

### Scenario: Plan Base user connects WhatsApp automation

- **GIVEN** a business with `subscriptionPlan = 'BASE'`
- **WHEN** the user attempts to connect WhatsApp QR automation
- **THEN** the system SHALL require Plan Pro activation.
