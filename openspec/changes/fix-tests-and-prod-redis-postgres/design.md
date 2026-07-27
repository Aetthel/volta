# Design: Fix Test Suite & External Production Redis & Postgres Integration

## Context

Volta backend utilizes PostgreSQL (via Prisma) for persistent data storage and Redis (via ioredis and BullMQ) for queuing and caching.
In production environments, managed external Postgres and Redis services are used instead of local container instances.
Currently:

1. `backend/src/tests/health.test.js` fails because `prisma.$queryRaw` is executed unmocked in test mode against an inactive DB.
2. `backend/src/config/redis.js` returns basic options when `REDIS_URL` is set, but does not parse URL components into options required by BullMQ `Queue` and `Worker` instances, causing BullMQ to default to `127.0.0.1:6379`.
3. `docker-compose.prod.yml` includes a local `redis` service container when external Redis is used, and requires proper environment variable defaults.

## Goals / Non-Goals

**Goals:**

- Fix `backend/src/tests/health.test.js` by mocking `prisma.$queryRaw` so that all test suites pass 100%.
- Clean up duplicate backup files (`* 2.js` and `* 2.*`).
- Refactor `backend/src/config/redis.js` so that `REDIS_URL` (including `redis://` and `rediss://` TLS URLs) or individual `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USERNAME`, `REDIS_TLS` settings work seamlessly across both `ioredis` client and BullMQ queues/workers.
- Make local `redis` container optional in `docker-compose.prod.yml` and provide clean configuration for external Redis & PostgreSQL.
- Document configuration in `.env.example` and `DEPLOYMENT.md`.

**Non-Goals:**

- Provisioning or managing external cloud infrastructure for Postgres/Redis (user provides their own managed endpoints).

## Decisions

1. **Mocking Prisma in Health Test**:
   - In `backend/src/tests/health.test.js`, add `jest.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }])` before invoking `/health`.
   - Rationale: Tests should verify route logic and status formatting without requiring an active PostgreSQL daemon.

2. **Unified Redis Configuration & URL Parsing**:
   - In `backend/src/config/redis.js`, parse `REDIS_URL` using standard `URL` parser if provided to extract `host`, `port`, `username`, `password`, `tls` (or pass explicit parameters for BullMQ compatibility).
   - Ensure `redisConnectionOptions` contains explicit host/port/auth/tls parameters so BullMQ queues and workers connect to the external endpoint instead of defaulting to localhost.

3. **Production Compose Adjustment**:
   - Update `docker-compose.prod.yml` to remove mandatory local Redis dependency when external `REDIS_URL` or `REDIS_HOST` is configured.
   - Keep environment mappings consistent across frontend and backend containers.

## Risks / Trade-offs

- [Risk: Invalid REDIS_URL format] → [Mitigation: Wrap URL parsing in safe try/catch block with fallback to standard host/port options].
- [Risk: Production DB deployment without SSL/TLS] → [Mitigation: Document `REDIS_TLS` and Prisma `sslmode` settings clearly in DEPLOYMENT.md].
