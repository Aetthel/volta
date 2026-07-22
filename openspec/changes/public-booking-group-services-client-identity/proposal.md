## Why

Volta needs to support public online booking for clients without forcing password registration, allow group sessions/classes (e.g. Yoga, Pilates, workshops) with custom attendance capacity, and uncouple client records so staff/bosses and multi-business clients can book or exist across different businesses cleanly without record locking.

## What Changes

- Add public booking toggle setting (`enablePublicBooking`) to `Business`.
- Add public booking endpoint and UI step allowing clients to pick available slots and book using name, phone, and optional email.
- Add `capacity` field to `Service` (default: 1 for individual appointments, >1 for group classes/workshops).
- Support group appointments (`Appointment`) with multiple registered participants (`AppointmentClient` or capacity tracking).
- Support phone/email recognition for clients so booking or adding clients across businesses does not duplicate or conflict with system users (`User`).

## Capabilities

### New Capabilities
- `public-booking`: Public booking page and API allowing unauthenticated clients to select services and book slots.
- `group-appointments`: Capacity management for group classes and multi-participant appointments.

### Modified Capabilities
- `business-subscription-and-demo-tiers`: Update feature limits for group classes and public booking toggles.

## Impact

- Database Schema: `Business` model gains `enablePublicBooking`, `Service` gains `capacity`, `Appointment` supports multiple participant links.
- Backend Routes: `/api/public/booking` endpoints added for public slot querying and booking.
- Frontend Routes: `/app/booking/[businessId]` public booking page created.
