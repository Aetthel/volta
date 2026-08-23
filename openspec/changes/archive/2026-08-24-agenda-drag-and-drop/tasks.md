# Implementation Tasks: Agenda Drag-and-Drop Appointment Rescheduling

## 1. Calendar Drag-and-Drop Handlers & State

- [x] 1.1 Update `frontend/app/(dashboard)/agenda/page.tsx` appointment cards with `draggable` attribute and `onDragStart`/`onDragEnd` events.
- [x] 1.2 Implement `onDragOver`, `onDragLeave`, and `onDrop` event handlers on calendar hour slot cells.
- [x] 1.3 Add visual hover highlighting on active dropzone target cells.

## 2. API Integration & Error Reversion

- [x] 2.1 Implement `handleDropReschedule` to make `PUT /api/backend/appointments/:id` API requests with the calculated target `appointmentDate`.
- [x] 2.2 Handle successful reschedule with optimistic UI state update and toast feedback.
- [x] 2.3 Handle rejection (400/409) with error toast notification and state reversion.
- [x] 2.4 Run `tsc --noEmit` and backend unit tests to verify system integrity.
