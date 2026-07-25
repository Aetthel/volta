# Appointment Management Delta Spec

## Modifies: appointment-management

### Requirement: Business Hours Enforcement
The system SHALL validate that any newly requested or rescheduled appointment falls within the configured operating hours (`BusinessHours`) of the associated business for that day of the week.
- IF the business is marked as `isClosed = true` for that day of the week, the system SHALL reject the creation request with a `400 Bad Request` error.
- IF the appointment start time is earlier than `openTime` OR the appointment end time (start time + service duration) is later than `closeTime`, the system SHALL reject the creation request with a `400 Bad Request` error.

### Requirement: Overbooking and Slot Collision Prevention
The system SHALL prevent double-booking or overbooking when creating or updating an appointment.
- The system SHALL calculate the start and end timestamp of the requested appointment based on the selected `Service` duration (defaulting to 30 minutes if no service duration is set).
- The system SHALL count existing active appointments for the business that overlap with the requested time window (`existingStart < requestedEnd` AND `existingEnd > requestedStart`).
- IF the count of overlapping active appointments equals or exceeds the service capacity (`Service.capacity`, default 1), the system SHALL reject the appointment creation with a `409 Conflict` error.

### Requirement: Available Slots Lookup
The system SHALL provide an API endpoint (`GET /api/public/booking/available-slots`) that takes `businessId`, `serviceId`, and `date` and returns an array of valid start time strings (e.g. `["09:00", "09:30", "10:00"]`) that do not violate business hours or capacity limits.
