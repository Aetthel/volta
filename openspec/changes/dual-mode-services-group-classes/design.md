## Context

Volta currently manages appointments as 1-on-1 private client bookings. To serve group-based businesses (Yoga, CrossFit, Pilates, Workshops) alongside 1-on-1 businesses (Hairdressers, Barbers, Clinics), Volta needs a dual-mode service architecture that supports max capacity limits, custom service color customization, and dual-mode enrollment (public self-service vs staff manual entry).

## Goals / Non-Goals

**Goals:**
- Add `type` (`INDIVIDUAL` vs `GROUP`), `maxCapacity`, and `color` fields to the `Service` model in Prisma schema.
- Support a 7-color palette picker (`TEAL`, `PURPLE`, `ROSE`, `AMBER`, `INDIGO`, `EMERALD`, `SKY`) in `/ajustes` -> Services tab.
- Display unified group class cards in `/agenda` with real-time occupancy indicators (`X/Y enrolled`).
- Provide an Attendee Drawer/Modal on group class cards in `/agenda` allowing staff to mark attendance (Present/Absent) and manually register clients.
- Enforce capacity collision checks (HTTP 409) when max capacity is reached.
- Allow public self-enrollment via `/booking/:businessId` with real-time open slot counters.

**Non-Goals:**
- Recurring automated class generation (handled manually or via week copy in future releases).
- Payment gateway integration for per-class credit packages (out of scope for this change).

## Decisions

1. **Schema Extension (`ServiceType` Enum & `color` String)**:
   - Add `enum ServiceType { INDIVIDUAL, GROUP }` to Prisma schema.
   - Add `type ServiceType @default(INDIVIDUAL)`, `maxCapacity Int @default(1)`, and `color String? @default("TEAL")` to `Service` model.
   - Add `attended Boolean @default(true)` to `Appointment` model for attendance tracking.

2. **Capacity Validation in `appointmentsService.js`**:
   - For `GROUP` services, multiple appointments can share the exact same `appointmentDate` and `serviceId` up to `service.maxCapacity`.
   - Prevent creation of a new appointment for a group session if `currentAppointmentsCount >= service.maxCapacity` (HTTP 409 Conflict: *"Capacidad máxima de la clase alcanzada"*).

3. **7-Color Custom Palette Design**:
   - Offer 7 curated Google Calendar-style pastel themes with 4px left accent borders (`border-l-4`):
     - `TEAL`: Turquesa
     - `PURPLE`: Violeta
     - `ROSE`: Rosa
     - `AMBER`: Ámbar
     - `INDIGO`: Índigo
     - `EMERALD`: Esmeralda
     - `SKY`: Azul Cielo

4. **Agenda Group Card & Attendee Modal**:
   - Aggregate group appointments by `(appointmentDate, serviceId)` into a single group card.
   - Show attendee badge count `12/15` and a "+ Alumno" quick-add button.
   - Clicking opens `GroupAttendeeModal` listing all enrolled clients with toggleable attendance checkboxes.

## Risks / Trade-offs

- **[Risk]** Overlapping 1-on-1 and Group slots for the same stylist/worker.
  - *Mitigation*: Workers assigned to a group class cannot take 1-on-1 appointments during that exact time window.
- **[Risk]** Race conditions during simultaneous public online registrations when 1 spot remains.
  - *Mitigation*: Wrap appointment creation in a Prisma transaction (`prisma.$transaction`) with count check before insertion.
