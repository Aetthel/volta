# Proposal: Fix Test Suite & External Production Redis & Postgres Integration

## Why

1. **Failing Unit/Integration Tests**: The test suite (`health.test.js`) is currently failing because the `/health` endpoint executes `prisma.$queryRaw` without a mocked database connection in Jest environment, causing a 503 response. Additionally, duplicate backup test files (`* 2.js`) exist in the test suite directory.
2. **Production Redis & Postgres Integration**: The project uses external managed instances of Redis and PostgreSQL in production. The production configuration in `docker-compose.prod.yml` and `backend/src/config/redis.js` must properly support external Redis (via `REDIS_URL` or standard host/port/auth/tls settings, ensuring BullMQ worker queues also use full connection options without falling back to localhost) and PostgreSQL without requiring local container dependencies.

## What Changes

- **Fix Test Suite Errors**:
  - Mock `prisma.$queryRaw` in `health.test.js` so `/health` checks verify DB status correctly during test runs.
  - Clean up duplicate `* 2.js` and `* 2.*` test files.
- **Harden & Standardize Production Redis & Postgres Support**:
  - Update `backend/src/config/redis.js` to parse `REDIS_URL` into full connection options (host, port, username, password, tls) so both `ioredis` client and BullMQ queues/workers connect to the production Redis instance correctly.
  - Update `docker-compose.prod.yml` to ensure backend and frontend services cleanly connect to external managed Postgres and Redis instances.
  - Update `.env.example` and `DEPLOYMENT.md` with explicit, production-ready documentation for external Redis and Postgres configurations.

## Capabilities

### New Capabilities

- `external-prod-redis-postgres`: Support for connecting backend services and BullMQ queues to external production Redis (via URL or host/port/auth/TLS) and PostgreSQL.

### Modified Capabilities

- `automated-testing-suite`: Ensure health check tests and overall test suites pass cleanly without external runtime dependencies.

## Impact

- `backend/src/tests/health.test.js`
- `backend/src/config/redis.js`
- `backend/src/queues/whatsappQueue.js`
- `backend/src/workers/whatsappWorker.js`
- `docker-compose.prod.yml`
- `.env.example`
- `DEPLOYMENT.md`
