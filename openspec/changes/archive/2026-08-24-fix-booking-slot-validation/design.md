# Design: Booking Slot Validation & Overbooking Control

## Context

Appointments in Volta are created via:

1. Business Dashboard (`/api/appointments` POST route)
2. Public Booking Portal (`/api/public/booking` POST route)

Currently, neither path validates whether:

- The requested `appointmentDate` falls within business opening hours (`BusinessHours` model).
- The requested time slot overlaps with an existing appointment for the same business exceeding the service capacity (`Service.capacity`).

## Technical Approach

### 1. Business Hours Validation Helper (`backend/src/utils/businessHours.js`)

- Fetch `BusinessHours` for the given `businessId` and `dayOfWeek` (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
- If `isClosed` is `true`, reject appointment with a 400 Bad Request ("El negocio está cerrado en el día seleccionado").
- Parse `openTime` ("09:00") and `closeTime` ("20:00").
- Extract appointment start time and end time (start time + `service.duration` minutes).
- Verify that `startTime >= openTime` and `endTime <= closeTime`.

### 2. Overlap & Capacity Check (`backend/src/services/appointmentsService.js`)

- Given `businessId`, `appointmentDate` (start), `durationMinutes`, and `capacity`:
  - Calculate `requestedStart` = `appointmentDate`
  - Calculate `requestedEnd` = `appointmentDate + durationMinutes`
- Query database for overlapping appointments:
  ```js
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      businessId,
      status: { not: "ERROR" },
      appointmentDate: {
        lt: requestedEnd,
      },
      // Note: We check if (existingStart < requestedEnd) AND (existingEnd > requestedStart)
    },
  });
  ```
- Filter out appointments whose calculated end time <= `requestedStart`.
- If `count(overlappingAppointments) >= service.capacity`, throw a 409 Conflict error ("El horario seleccionado ya está reservado").

### 3. Slot Availability API Endpoint (`GET /api/public/booking/available-slots`)

- Endpoint parameters: `businessId`, `serviceId`, `date` (YYYY-MM-DD).
- Computes all available start time slots for that day in 15/30-minute intervals based on business hours and service duration.
- Returns list of available slot strings: `["09:00", "09:30", "10:00", ...]`.

## Architecture Diagram

```
Public Booking / Dashboard API
             │
             ▼
   [Validation Layer]
  1. Parse & Normalize Input Date
  2. Query BusinessHours (dayOfWeek)
     └── Is closed? ──▶ Return 400 Bad Request
     └── Out of bounds? ──▶ Return 400 Bad Request
  3. Service Lookup (Duration & Capacity)
  4. Query Overlapping Appointments
     └── Over capacity? ──▶ Return 409 Conflict
  5. Create Appointment in DB
```

## Risks & Mitigations

- **Timezone handling**: Dates must be evaluated in UTC or local business timezone consistently. We will use ISO 8601 strings and explicit UTC/local offsets.
- **Race conditions**: Simultaneous public bookings for the last slot. We will wrap slot validation and appointment creation in a Prisma `$transaction`.
