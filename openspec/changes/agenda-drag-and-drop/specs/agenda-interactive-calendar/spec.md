# Agenda Interactive Calendar New Spec

## Capability: agenda-drag-and-drop

### Requirement: Draggable Appointment Cards
The system SHALL render appointment cards in `/agenda` with `draggable={true}`, storing appointment metadata (ID, service duration, original start date) on drag start.

### Requirement: Dropzone Targets & Visual Hover Feedback
The system SHALL treat each hour slot cell in the agenda grid as a valid dropzone target.
- When an appointment is dragged over a time slot, the system SHALL highlight the slot visually with active dropzone feedback.
- On drop, the system SHALL calculate the new target `appointmentDate` combining the target column date and time slot.

### Requirement: Reschedule Persistence & Validation Feedback
The system SHALL call `PUT /api/backend/appointments/:id` with the new target date.
- IF the backend confirms the rescheduled date, the UI SHALL update appointment state instantly and display a confirmation toast.
- IF the backend rejects the reschedule due to business hours or capacity collision, the system SHALL revert the appointment card to its original slot and display an error toast notification.
