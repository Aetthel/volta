## Why

The Volta codebase currently lacks comprehensive unit, integration, and E2E test coverage across both frontend and backend services:
- Backend test coverage is limited to generic utility helpers and middleware, leaving critical controllers, services, database transactions, and API routes untested.
- Frontend test coverage is 0% with no testing framework (Vitest/Testing Library/Playwright) configured in package.json.

Establishing a solid, multi-layered testing suite ensures code reliability, prevents regressions during feature development, validates multitenant security boundaries, and verifies end-to-end user workflows.

## What Changes

1. **Backend Integration & Service Testing**:
   - Add controller integration tests using `supertest` for critical endpoints (`POST /api/users/register`, `POST /api/demo`, `DELETE /api/demo`, `POST /api/public/reserve`).
   - Add unit tests for backend business services (`userService`, `demoService`, `appointmentsService`, `adminService`).

2. **Frontend Unit & Component Testing (Vitest)**:
   - Configure **Vitest** with `@testing-library/react` and `jsdom` in `frontend/package.json`.
   - Add unit tests for core UI components (`volta-ui`) and multi-step pages (`register/page.tsx`).

3. **Frontend End-to-End Testing (Playwright)**:
   - Configure **Playwright** for end-to-end testing of full user registration and dashboard workflows.

## Capabilities

### New Capabilities
- `automated-testing-suite`: Comprehensive test coverage across backend services, frontend components, and E2E workflows.

### Modified Capabilities
- `web-authentication`: Requirements updated to mandate full test coverage for registration, rate limiting, and session verification.

## Impact

- `backend/package.json`: Additional test commands and supertest route test suites.
- `frontend/package.json`: Installation of `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`, and test scripts (`test`, `test:ui`, `test:e2e`).
- `backend/src/tests/`: Service and route integration tests.
- `frontend/src/tests/`: Component and page unit tests.
- `frontend/e2e/`: Playwright E2E spec files.
