# Design: Redis Infrastructure & Asynchronous Message Queues (BullMQ)

## Architecture Overview

```
                      PRODUCER (API / Cron)
                     ┌──────────────────────┐
                     │ Express API / Cron   │
                     │  - runSentinel()     │
                     │  - sendWelcome()     │
                     │  - sendConsent()     │
                     └──────────┬───────────┘
                                │ enqueue(job)
                                ▼
                     ┌──────────────────────┐
                     │    REDIS 7 SERVER    │
                     │  (bullmq:whatsapp)   │
                     └──────────┬───────────┘
                                │ process(job)
                                ▼
                      CONSUMER (Worker Process)
                     ┌──────────────────────┐
                     │   whatsappWorker.js  │
                     │  - WhatsApp Manager  │
                     │  - Retry with Backoff│
                     └──────────────────────┘
```

## BullMQ Queue Configuration

- Queue Name: `whatsappQueue`
- Job Types:
  - `SENTINEL_REMINDER`: `{ appointmentId, businessId, clientPhone, message }`
  - `WELCOME_MESSAGE`: `{ appointmentId, businessId, clientPhone, message }`
  - `LOPD_CONSENT`: `{ clientId, businessId, clientPhone, message }`
- Job Options:
  - `attempts`: 3
  - `backoff`: `{ type: "exponential", delay: 5000 }` (5s, 10s, 20s)
  - `removeOnComplete`: `{ age: 86400, count: 1000 }`
  - `removeOnFail`: `{ age: 604800 }`

## Redis Connection (`backend/src/config/redis.js`)

Uses `ioredis`:
```js
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
```
Fallback gracefully if Redis is unavailable in local dev (falls back to direct send or logs warning).

## Worker Implementation (`backend/src/workers/whatsappWorker.js`)

Listens on `whatsappQueue`:
```js
const worker = new Worker("whatsappQueue", async (job) => {
  const { businessId, clientPhone, message, appointmentId } = job.data;
  await whatsappManager.initClient(businessId);
  await whatsappManager.waitForReady(businessId, 45000);
  await whatsappManager.sendMessage(businessId, clientPhone, message);
  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "SENT" },
    });
  }
}, { connection: redisConfig });
```
