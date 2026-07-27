## 1. Test Suite Fixes

- [ ] 1.1 Fix `backend/src/tests/health.test.js` by mocking `prisma.$queryRaw` to return healthy status in test environment.
- [ ] 1.2 Clean up duplicate backup files (`* 2.js` and `* 2.*`) from `backend/src/tests/routes/`, `openspec/`, and repository root.
- [ ] 1.3 Verify test suite execution with `pnpm test` (backend) and `pnpm --filter frontend test` to guarantee 100% pass rate.

## 2. Redis & Postgres Production Configuration

- [ ] 2.1 Refactor `backend/src/config/redis.js` to parse `REDIS_URL` into explicit connection options (`host`, `port`, `username`, `password`, `tls`) compatible with both `ioredis` and BullMQ `Queue`/`Worker` connection options.
- [ ] 2.2 Update `docker-compose.prod.yml` to make local Redis container optional/external-friendly, maintaining clean environment variable injection (`DATABASE_URL`, `REDIS_URL`, `REDIS_HOST`, etc.).
- [ ] 2.3 Update `.env.example` and `DEPLOYMENT.md` to document external production PostgreSQL and Redis endpoint settings securely and professionally.

## 3. Verification & Validation

- [ ] 3.1 Run `pnpm test` to verify backend tests pass.
- [ ] 3.2 Run `pnpm --filter frontend test` to verify frontend tests pass.
- [ ] 3.3 Verify container configuration and build readiness.
