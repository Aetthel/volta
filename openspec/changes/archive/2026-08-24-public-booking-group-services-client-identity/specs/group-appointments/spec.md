## ADDED Requirements

### Requirement: Service Capacity Management

Businesses can set an attendance capacity (>1) for group services such as classes or workshops.

#### Scenario: Creating a group service

- **WHEN** a service is created with `capacity: 15`
- **THEN** up to 15 clients can book the same date/time slot for that service

### Requirement: Slot Capacity Availability

The booking system must prevent bookings exceeding the service capacity limit.

#### Scenario: Slot reaches max capacity

- **WHEN** a slot has reached its maximum configured capacity
- **THEN** the slot is marked as "Full / Completo" and rejects additional booking attempts
