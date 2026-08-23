# Proposal: Fix Booking Slot Validation & Overbooking Control

## Why

Currently, Volta allows booking appointments at any time, even outside business operating hours (e.g. at 3:00 AM on Sunday when closed) and allows overlapping appointments in the exact same time slot for the same business regardless of capacity. This leads to double-booking, invalid appointment times, and scheduling conflicts in production.

## What Changes

- Add strict Business Hours enforcement during appointment creation (both internal API and public booking portal).
- Add Slot Collision & Capacity Overlap Detection: calculate service duration, check existing appointments for the business in that time window, and block double-booking when capacity is exceeded.
- Return structured HTTP 400/409 error responses with descriptive messages when a requested slot is invalid or already occupied.
- Expose an API helper / public route to query available time slots for a given date and service.

## Capabilities

### Modified Capabilities

- `appointment-management`: Enforce operating hours validation, slot overlap checking, and availability queries when creating/updating appointments.

## Impact

- `backend/src/services/appointmentsService.js`: Update `createAppointment` to validate business hours and existing appointment overlaps.
- `backend/src/validators/appointmentValidator.js` (or inline validator): Add schema rules for valid date/time ranges.
- `backend/src/routes/publicBooking.js` & `appointments.js`: Handle validation errors and return clear error responses.
- Frontend booking components: Provide feedback when a chosen time slot is unavailable or out of business hours.
