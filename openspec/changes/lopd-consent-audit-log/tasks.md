# Implementation Tasks: LOPD Consent Audit Trail & Verification Logs

## 1. Database Model & Migration
- [x] 1.1 Update `backend/prisma/schema.prisma` with `LopdConsentLog` model.
- [x] 1.2 Run `pnpm --filter backend prisma:generate` to update Prisma Client.

## 2. Backend Consent Audit Controller & Service
- [x] 2.1 Update `backend/src/routes/lopd.js` and `lopdController.js` to extract `ipAddress` (handling proxy headers) and `userAgent`.
- [x] 2.2 Update `backend/src/services/lopdService.js` to record `LopdConsentLog` entry upon consent acceptance.
- [x] 2.3 Add unit tests in `backend/src/tests/services/lopdService.test.js` verifying consent log creation.

## 3. Dashboard Verification UI
- [x] 3.1 Expose client consent log in client detail query/endpoint (`GET /api/lopd/:id/logs`).
- [x] 3.2 Add LOPD Audit badge and details in clients view in frontend.
