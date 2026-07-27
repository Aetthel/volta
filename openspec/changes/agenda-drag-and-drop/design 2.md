# Design: Agenda Drag-and-Drop Appointment Rescheduling

## User Flow

1. User grabs an appointment card in `/agenda` (cursor changes to `grab`/`grabbing`).
2. As the user drags over calendar hour slots (`09:00`, `10:00`, etc.) and days (Mon..Sun), the target slot highlights with a subtle primary border and background tint (`bg-primary/10`).
3. User releases (drops) the appointment on a valid target slot.
4. Client sends `PUT /api/backend/appointments/:id` with new `appointmentDate`.
5. If successful:
   - UI updates appointment position immediately with smooth animation.
   - Toast notification shows: "Cita movida a [Día] a las [Hora]".
6. If validation fails (e.g. business closed or capacity full):
   - Appointment returns to original position.
   - Toast notification shows warning error.

## Technical Details

- **HTML5 Drag & Drop API**:
  - Appointment Card: `draggable={true}`, `onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ appointmentId, duration }))}`
  - Target Slot Cell: `onDragOver={(e) => e.preventDefault()}`, `onDrop={(e) => handleDrop(e, dayIndex, timeSlot)}`
- **Visual Feedback State**:
  - `draggedApptId`: ID of currently dragged appointment.
  - `activeDropSlot`: `{ dayIndex, timeSlot }` of active hover target.
