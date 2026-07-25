# Implementation Tasks: Fix Booking Slot Validation & Overbooking Control

## 1. Business Hours & Slot Validation Utilities
- [x] 1.1 Create `backend/src/utils/businessHours.js` helper functions:
  - `isBusinessOpenAt(businessHours, appointmentDate, durationMinutes)`
  - `validateBusinessHours(businessHours, date, duration)`
- [x] 1.2 Unit tests for business hours calculation in `backend/src/tests/utils/businessHours.test.js`.

## 2. Service Layer Slot Overlap Detection
- [x] 2.1 Update `createAppointment` in `backend/src/services/appointmentsService.js`:
  - Fetch service duration and capacity.
  - Verify business hours alignment before creating.
  - Count overlapping active appointments (`status != 'ERROR'`) and enforce `count < service.capacity`.
  - Wrap check and creation inside Prisma transaction to prevent race conditions.
- [x] 2.2 Unit tests for `createAppointment` validation failures (closed days, out of hours, capacity collision) in `backend/src/tests/services/appointmentsService.test.js`.

## 3. Public Booking Endpoint & Available Slots API
- [x] 3.1 Implement `GET /api/public/booking/available-slots` route in `backend/src/routes/publicBooking.js`:
  - Calculate available 30-minute slot start times for a requested day.
- [x] 3.2 Ensure error handling returns structured 400 (Out of hours) and 409 (Slot occupied) error responses.

## 4. Frontend & E2E Verification
- [x] 4.1 Update public booking form UI to fetch available slots and display friendly error messages when booking fails due to closed business hours or slot collisions.
- [x] 4.2 Run unit test suite `pnpm test` and verify clean build.
