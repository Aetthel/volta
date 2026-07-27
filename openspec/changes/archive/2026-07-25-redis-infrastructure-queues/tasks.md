# Implementation Tasks: Redis Infrastructure & Asynchronous Message Queues (BullMQ)

## 1. Docker Compose & Environment Setup

- [x] 1.1 Add `redis` service (`redis:7-alpine`) to `docker-compose.yml` and `docker-compose.prod.yml`.
- [x] 1.2 Add `bullmq` and `ioredis` dependencies to `backend/package.json`.

## 2. Redis Connection & Queue Producer

- [x] 2.1 Create `backend/src/config/redis.js` with ioredis client configuration and connection health check.
- [x] 2.2 Create `backend/src/queues/whatsappQueue.js` helper functions (`enqueueWhatsAppMessage`).
- [x] 2.3 Update `botService.js` (`runSentinel`, `sendWelcomeMessage`, `sendConsentMessage`) to enqueue jobs.

## 3. Background Worker Consumer

- [x] 3.1 Create `backend/src/workers/whatsappWorker.js` to process queued jobs with retry policy and appointment status updates.
- [x] 3.2 Add unit test suite in `backend/src/tests/queues/whatsappQueue.test.js`.
