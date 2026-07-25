# Proposal: Redis Infrastructure & Asynchronous Message Queues (BullMQ)

## Why

Currently, background tasks such as daily WhatsApp reminder dispatches (The Sentinel) and LOPD consent requests run synchronously in-process within the main Node.js Express server. If an outbound WhatsApp message times out or the server restarts during cron execution, messages are marked as `ERROR` without retry policies. Furthermore, running Puppeteer tasks in the main HTTP API process risks memory spikes that can crash the entire web application.

## What Changes

- Add a Redis container service (`redis:7-alpine`) to `docker-compose.yml` and `docker-compose.prod.yml`.
- Create a dedicated Redis connection module in `backend/src/config/redis.js`.
- Integrate `bullmq` to manage asynchronous message job queues (`whatsappQueue`) with exponential backoff retry policies.
- Update `botService.js` and `runSentinel` to delegate message dispatches to the Redis job queue instead of blocking execution.
- Create an asynchronous background worker (`backend/src/workers/whatsappWorker.js`) to process WhatsApp sending jobs reliably.

## Capabilities

### New Capabilities

- `redis-queue-management`: Manages Redis connection, BullMQ queue dispatching, and background worker processing with automated retry policies.

### Modified Capabilities

- `notification-automation`: The Sentinel enqueues notification jobs into BullMQ instead of synchronously sending them in a loop.

## Impact

- `docker-compose.yml` & `docker-compose.prod.yml`: Add `redis` service on port `6379`.
- `backend/package.json`: Add `bullmq` and `ioredis` dependencies.
- `backend/src/config/redis.js`: Connection client configuration.
- `backend/src/services/botService.js`: Queue producer helpers (`enqueueMessage`).
- `backend/src/workers/whatsappWorker.js`: Queue consumer worker.
