## ADDED Requirements

### Requirement: Service Type Configuration and 7-Color Theme Palette
The system SHALL allow business managers (`ADMIN` and `JEFE`) to create and edit services with a `type` (`INDIVIDUAL` or `GROUP`), `maxCapacity` limit, and a selection from 7 pastel color themes (`TEAL`, `PURPLE`, `ROSE`, `AMBER`, `INDIGO`, `EMERALD`, `SKY`).

#### Scenario: Creating a group service with max capacity and color theme
- **WHEN** a business manager opens `/ajustes` -> Services and creates a service "Hatha Yoga" with type `GROUP`, max capacity `15`, and color `EMERALD`
- **THEN** the system SHALL save the service in PostgreSQL with `type: GROUP`, `maxCapacity: 15`, and `color: EMERALD`

---

### Requirement: Group Session Capacity Validation and Collision Check
The system SHALL allow multiple appointments to share the same start time and service for `GROUP` services up to `maxCapacity`. When a group session reaches its `maxCapacity`, further registration attempts SHALL be rejected with HTTP 409 Conflict.

#### Scenario: Enrolling in a group class with available spots
- **WHEN** a client or staff member registers a client for a group session with `currentEnrolled < maxCapacity`
- **THEN** the system SHALL create the appointment record and update the session occupancy count

#### Scenario: Attempting to register when max capacity is reached
- **WHEN** a client or staff member attempts to register for a group session with `currentEnrolled >= maxCapacity`
- **THEN** the system SHALL reject the request with HTTP 409 Conflict and return an error message "Capacidad máxima de la clase alcanzada"

---

### Requirement: Interactive Group Session Agenda View and Attendee Drawer
The system SHALL aggregate group session appointments into unified cards on the agenda calendar display (`/agenda`), showing real-time `X/Y` attendee badges, custom theme colors, and an interactive attendee drawer for attendance tracking and manual staff registrations.

#### Scenario: Managing attendance and adding attendees manually
- **WHEN** staff clicks a group class card in `/agenda`
- **THEN** the system SHALL display the attendee drawer showing all enrolled clients, toggleable attendance checkboxes (Present/Absent), and a "+ Añadir Alumno" button for instant manual registration
