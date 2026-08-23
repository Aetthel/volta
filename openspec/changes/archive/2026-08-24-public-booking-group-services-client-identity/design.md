## Context

Volta currently supports 1-to-1 appointments and requires business staff authentication to create clients and appointments. To expand to group activities (yoga, workshops) and friction-free public bookings, the database and API need capacity-aware service data, multi-client slot tracking, and public booking endpoints.

## Goals / Non-Goals

**Goals:**

- Enable optional public booking per business (`enablePublicBooking` boolean flag).
- Support group services with configurable participant capacity (`capacity: Int @default(1)`).
- Allow multiple client bookings on a single group appointment slot.
- Recognize existing clients by phone number during public booking without duplicating records.

**Non-Goals:**

- Creating mandatory password accounts for end-clients.
- Payment gateway integration for public bookings (out of scope for this change).

## Decisions

1. **Service Capacity & Slot Availability**:
   - `Service.capacity` specifies max clients per session.
   - For `capacity = 1`, current single-slot logic applies.
   - For `capacity > 1`, slot query checks count of active bookings for that slot.

2. **Client Recognition by Phone**:
   - When a booking is submitted via public API, system searches `Client` by `phone` + `businessId`.
   - If found, binds appointment to existing `clientId`.
   - If not found, creates a new `Client` record for that business.

3. **Public API Endpoint**:
   - Endpoint `/api/public/booking/:businessId` exposes services, available slots, and slot booking without requiring JWT session cookies.

## Risks / Trade-offs

- [Risk] Spam public bookings → Mitigation: Rate-limiting public booking requests and validating phone number formats.
- [Risk] Overbooking group classes → Mitigation: Atomic transaction check when confirming a booking for a slot with limited remaining capacity.
