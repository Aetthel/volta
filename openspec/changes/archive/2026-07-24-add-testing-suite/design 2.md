## Context

The Volta application architecture consists of an Express.js REST API backend with Prisma ORM and a Next.js 16 (App Router) React frontend.
While basic backend helper unit tests exist in `backend/src/tests/`, there are currently zero integration tests for backend controllers/routes, zero tests for core business services, and zero tests in the frontend.

## Goals / Non-Goals

**Goals:**

- Implement backend service unit tests and controller integration tests using Jest and Supertest.
- Setup Vitest, `@testing-library/react`, and `@testing-library/jest-dom` in the frontend for component and page unit tests.
- Setup Playwright in the frontend for end-to-end user journey validation.
- Maintain fast execution speeds (< 10s for unit tests) with isolated mocks and clear test scripts.

**Non-Goals:**

- 100% mutation testing coverage on legacy unused helper code.
- Performance load testing (JMeter/k6) under high throughput (handled in separate infra benchmarks).

## Decisions

1. **Jest + Supertest for Backend Testing**:
   - Rationale: `jest` and `supertest` are already in `backend/package.json`. We structure test files into `backend/src/tests/services/` and `backend/src/tests/routes/` to mirror the production folder structure.

2. **Vitest + React Testing Library for Frontend Component Testing**:
   - Rationale: Vitest integrates natively with Next.js and SWC/ESM without complex Webpack transforms, providing instant feedback and fast HMR test execution.

3. **Playwright for End-to-End Testing**:
   - Rationale: Playwright provides reliable multi-browser automation for testing the registration flow, auth sessions, and dashboard navigation natively in headless mode.

## Risks / Trade-offs

- [Risk: Async Database state leaks in integration tests] → Mitigation: Use database transaction rollbacks or isolated test database instances for Supertest endpoints.
- [Risk: Playwright browser installation overhead in CI] → Mitigation: Configure Playwright to use headless Chromium with cached dependencies.
