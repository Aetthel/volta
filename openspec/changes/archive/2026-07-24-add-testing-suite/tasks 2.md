## 1. Backend Integration & Service Testing

- [x] 1.1 Add unit test suite for `userService.js` covering registration, password hashing, and case-insensitive email lookup
- [x] 1.2 Add unit test suite for `demoService.js` covering sandbox creation, cascading deletion, and expired demo cleanup
- [x] 1.3 Add unit test suite for `appointmentsService.js` covering client creation, phone normalization, and service assignment
- [x] 1.4 Add Supertest integration tests for `POST /api/users/register` (checking rate limiting and transaction atomicity)
- [x] 1.5 Add Supertest integration tests for `POST /api/demo` and `DELETE /api/demo` (checking demo sandbox creation and cascade delete)
- [x] 1.6 Add Supertest integration tests for `POST /api/public/reserve` (checking public booking validation and capacity limits)

## 2. Frontend Component & Page Unit Testing (Vitest)

- [x] 2.1 Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` in `frontend/package.json`
- [x] 2.2 Add `vitest.config.ts` configuration file with path aliases and React testing environment setup
- [x] 2.3 Add unit tests for `frontend/components/ui/volta-ui.tsx` (`Button`, `Alert`, `Badge`, `PageHeader`)
- [x] 2.4 Add unit tests for `frontend/app/register/page.tsx` validating step-by-step form navigation (Step 1 ➔ Step 4)

## 3. Frontend End-to-End Testing (Playwright)

- [x] 3.1 Install `@playwright/test` and setup `playwright.config.ts` in `frontend`
- [x] 3.2 Add Playwright E2E spec for user registration flow (`e2e/register.spec.ts`)
- [x] 3.3 Add `test:e2e` script to root and frontend `package.json`

## 4. Verification & CI Integration

- [x] 4.1 Execute `pnpm --filter backend test` and verify 100% test pass rate
- [x] 4.2 Execute `pnpm --filter frontend test` and verify 100% component test pass rate
- [x] 4.3 Execute `pnpm --filter frontend test:e2e` and verify headless Playwright flow
