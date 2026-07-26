# Redis Queue Management New Spec

## Capability: redis-queue-management

### Requirement: Redis Container Infrastructure
The system SHALL define a Redis service in Docker Compose (`docker-compose.yml` and `docker-compose.prod.yml`) running `redis:7-alpine` listening on port `6379`.

### Requirement: Asynchronous WhatsApp Message Queueing (BullMQ)
The system SHALL manage an asynchronous message queue (`whatsappQueue`) powered by BullMQ and Redis.
- The queue SHALL accept job dispatches for welcome messages, Sentinel daily reminders, and LOPD consent requests.
- Failed message delivery jobs SHALL automatically retry up to 3 times using an exponential backoff policy (5s initial delay).
- IF Redis is unavailable, the queue helper SHALL fall back gracefully to direct execution or log a warning without crashing the API process.

### Requirement: Asynchronous Background Message Worker
The system SHALL run a background worker (`whatsappWorker.js`) that consumes jobs from `whatsappQueue`, initializes WhatsApp web clients, sends messages, and updates appointment status in PostgreSQL.
