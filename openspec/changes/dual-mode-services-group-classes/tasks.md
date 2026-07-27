# Implementation Tasks: Dual-Mode Services & Group Classes with Color Themes

## 1. Schema & Backend Foundation

- [x] 1.1 Update `backend/prisma/schema.prisma` with `ServiceType` enum (`INDIVIDUAL`, `GROUP`), `maxCapacity` (Int, default 1), and `color` (String, default "TEAL") on `Service` model, and `attended` (Boolean, default true) on `Appointment` model.
- [x] 1.2 Run `prisma generate` to update Prisma client.
- [x] 1.3 Update `backend/src/services/appointmentsService.js` to enforce `GROUP` session capacity collision checking (HTTP 409) and attendee aggregation endpoints.

## 2. Service Management & Color Theme Picker

- [x] 2.1 Update `frontend/app/(dashboard)/ajustes/page.tsx` service form to include Service Type toggle (Individual vs Group), max capacity input field, and 7-color palette selector (`TEAL`, `PURPLE`, `ROSE`, `AMBER`, `INDIGO`, `EMERALD`, `SKY`).
- [x] 2.2 Save and load `color`, `type`, and `maxCapacity` fields via `/api/backend/services` endpoints.

## 3. Agenda Group Class Cards & Attendee Manager

- [x] 3.1 Update `frontend/app/(dashboard)/agenda/page.tsx` to group group session appointments into unified cards with real-time `X/Y enrolled` attendee counters and 4px left accent borders (`border-l-4`).
- [x] 3.2 Implement `GroupAttendeeModal` component in `/agenda` with attendance toggle checkboxes (Present/Absent) and "+ Add Attendee" quick manual registration.

## 4. Verification & Testing

- [x] 4.1 Verify TypeScript compilation with `pnpm --filter frontend exec tsc --noEmit`.
- [x] 4.2 Run backend unit test suite (`pnpm --filter backend test`) to verify clean passing.
