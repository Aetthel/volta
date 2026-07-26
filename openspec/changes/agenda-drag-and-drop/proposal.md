# Proposal: Agenda Drag-and-Drop Appointment Rescheduling

## Why

Currently, rescheduling an appointment in `/agenda` requires clicking on an appointment, opening the edit modal, and manually selecting a new date and time slot. Adding native Drag-and-Drop (HTML5 Drag & Drop API) allows business owners and employees to quickly drag an appointment card to a new time slot or day, providing an intuitive desktop and mobile interactive experience.

## What Changes

- Update `frontend/app/(dashboard)/agenda/page.tsx` to enable `draggable` on appointment cards.
- Add `onDragStart`, `onDragOver`, and `onDrop` handlers on calendar time slots.
- Show visual drop targets and hover feedback when dragging an appointment.
- Call `PUT /api/backend/appointments/:id` on drop to persist the new date and time.
- Validate that the target time slot does not violate operating hours or capacity limits before persisting. Show toast feedback if valid or error message if blocked.

## Capabilities

### New Capabilities

- `agenda-drag-and-drop`: Enables interactive drag-and-drop appointment rescheduling directly in the calendar grid.

### Modified Capabilities

- `agenda-interactive-calendar`: Expands calendar interaction with drag-and-drop dropzones and visual feedback.

## Impact

- `frontend/app/(dashboard)/agenda/page.tsx`: Drag & drop event handlers and dynamic state updates.
- `backend/src/services/appointmentsService.js`: Reuses existing slot validation when rescheduling appointments via API.
