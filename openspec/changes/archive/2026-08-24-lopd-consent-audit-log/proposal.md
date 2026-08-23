# Proposal: LOPD Consent Audit Trail & Verification Logs

## Why

Under Spanish LOPD/RGPD regulations (AEPD enforcement), storing a simple string field `lopdStatus: "Aceptado"` is legally insufficient in an audit. Data controllers must maintain an immutable, verifiable log proving _when_, _how_, and _under what terms_ consent was granted, including the client's IP address, timestamp, User-Agent, and terms version.

## What Changes

- Add a new `LopdConsentLog` model in Prisma to store immutable consent audit records.
- Record IP address, User-Agent, timestamp, consent token, and legal terms version whenever a client accepts LOPD consent.
- Update the public LOPD accept controller (`POST /api/lopd/accept`) to create this audit log entry.
- Expose a client consent audit view in the business dashboard to display legal proof of consent when needed.

## Capabilities

### Modified Capabilities

- `lopd-consent-workflow`: Capture full immutable audit trails (IP, User-Agent, timestamp, terms version) upon consent acceptance.

## Impact

- `backend/prisma/schema.prisma`: Add `LopdConsentLog` model relation to `Client` and `Business`.
- `backend/src/services/lopdService.js`: Record audit log upon consent acceptance.
- `backend/src/routes/lopd.js`: Extract `req.ip` and `req.headers["user-agent"]`.
- `frontend/app/lopd/[clientId]/page.tsx`: Pass user consent confirmation.
