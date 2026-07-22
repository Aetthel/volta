## ADDED Requirements

### Requirement: Public Booking Setting
The business owner can toggle whether public online booking is enabled for their business.

#### Scenario: Business enables public booking
- **WHEN** the business toggles `enablePublicBooking` to `true`
- **THEN** the public booking portal `/booking/[businessId]` becomes accessible to unauthenticated users

#### Scenario: Business disables public booking
- **WHEN** the business toggles `enablePublicBooking` to `false`
- **THEN** requests to `/booking/[businessId]` show a "Public booking disabled" message

### Requirement: Friction-free Client Booking
Clients can book available slots using name, phone, and optional email without registering a password.

#### Scenario: Client submits a valid booking
- **WHEN** a client submits name, phone number, date, and service ID
- **THEN** an appointment is reserved and linked to the existing or newly created `Client` record for that business
