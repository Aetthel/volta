# LOPD Consent Workflow Delta Spec

## Modifies: lopd-consent-workflow

### Requirement: Immutable Consent Audit Logging
When a client accepts LOPD consent via the public consent page (`/lopd/[clientId]`), the system SHALL record an immutable audit log entry in `LopdConsentLog`.
- The audit record SHALL contain `clientId`, `businessId`, `ipAddress`, `userAgent`, `acceptedAt` timestamp, and `policyVersion`.
- The system SHALL extract `ipAddress` reliably handling proxy headers (`x-forwarded-for`).

### Requirement: Client Consent Verification UI
The business dashboard SHALL display legal consent audit details (IP address, timestamp, User-Agent, and status) for any client whose LOPD status is `Aceptado`.
