## Why

Volta currently assumes all bookings are 1-on-1 private appointments (1 client per time slot). To expand Volta into high-value group business sectors (such as Yoga studios, Pilates, CrossFit boxes, dance academies, and group workshops), businesses must be able to define group class sessions with max capacity limits and custom color coding. Furthermore, clients must be able to self-enroll via public links while staff can manually register clients in-person or via phone.

## What Changes

- **Prisma Schema (`Service` & `Appointment`)**:
  - Add `type` (`INDIVIDUAL` vs `GROUP`), `maxCapacity` (default 1), and `color` (`TEAL`, `PURPLE`, `ROSE`, `AMBER`, `INDIGO`, `EMERALD`, `SKY`) to the `Service` model.
  - Add `parentAppointmentId` or `isGroupSession` flag to link individual attendees to a parent group session appointment.
- **Service Management (`/ajustes`)**:
  - Add a toggle for Service Type (Individual vs Group) and capacity input field.
  - Add a 7-color palette picker UI for custom service color assignment.
- **Interactive Agenda (`/agenda`)**:
  - Render group class sessions as unified broad cards displaying real-time occupancy (e.g., `12/15 enrolled`).
  - Add interactive attendee drawer/modal with check-in checkboxes (Present/Absent) and "+ Add Attendee" quick search action.
  - Render cards using custom assigned service colors with 4px left accent borders.
- **Public Booking Portal (`/booking/:businessId`)**:
  - Render weekly group class schedule for businesses offering group sessions, displaying remaining open spots and an "Enroll" button.

## Capabilities

### New Capabilities
- `dual-mode-services-group-classes`: Enables 1-on-1 appointments and 1-to-many group sessions with max capacity tracking, custom 7-color service themes, and dual-mode enrollment (self-service vs manual staff registration).

### Modified Capabilities
- None.

## Impact

- `backend/prisma/schema.prisma`: Schema update for `Service` and `Appointment` models.
- `backend/src/services/appointmentsService.js` & `servicesService.js`: Group session capacity check & attendee aggregation.
- `frontend/app/(dashboard)/ajustes/page.tsx`: Color picker and group service configuration UI.
- `frontend/app/(dashboard)/agenda/page.tsx`: Group class cards, attendee manager modal, and custom color rendering.
- `frontend/app/(public)/booking/[businessId]/page.tsx`: Group class schedule view & self-enrollment.
