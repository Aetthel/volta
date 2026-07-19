## 1. Authentication Security Hardening

- [x] 1.1 Fix the credentials login rate limiter to inspect 302 redirects and 200 JSON errors in `frontend/app/api/auth/[...nextauth]/route.js`
- [x] 1.2 Add byte-length verification check in `frontend/lib/crypto.ts` before `crypto.timingSafeEqual`

## 2. WhatsApp Stability and Event Cleaning

- [x] 2.1 Reimplement `waitForReady` in `backend/src/services/whatsappService.js` to cleanly remove all temporary event listeners on completion/failure
- [x] 2.2 Add database state checking to `runSentinel` in `backend/src/services/botService.js` to fail fast on disconnected or QR-pending accounts

## 3. Database Query Performance Optimization

- [x] 3.1 Optimize `createAppointment` client lookup in `backend/src/services/appointmentsService.js` to use database-level queries instead of in-memory scans
- [x] 3.2 Verify all code changes locally by running test suites or starting services
