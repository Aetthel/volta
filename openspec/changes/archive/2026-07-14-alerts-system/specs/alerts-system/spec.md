## ADDED Requirements

### Requirement: Alert Data Persistence
The system SHALL store user-specific alert entries in the database, each categorized by type (`EMERGENTE`, `AVISO`, or `NOTIFICACION`), storing title, description, read state (`isRead`), user association (`userId`), and timestamps.

#### Scenario: Backend creates system warning
- **WHEN** the backend detects a system warning event (e.g., WhatsApp disconnection)
- **THEN** it SHALL create an `AVISO` alert record for all authorized users of that business

### Requirement: Alert Fetching & Status Indicator
The system SHALL allow authenticated users to retrieve their alerts through the API. The frontend SHALL display a visual dot indicator on the header bell icon if the user has any unread alerts (`isRead: false`).

#### Scenario: Bell icon badge visibility
- **WHEN** the user has at least one unread alert
- **THEN** the header bell button SHALL render a small, styled visual dot badge

### Requirement: Pinned Emergente Carousels
The system SHALL render unread `EMERGENTE` alerts in a single card container containing pagination dots representing the total number of emergentes. The user can navigate through slides and dismiss each alert individually, which marks it as read. This card is displayed in the dashboard on session load and pinned at the top of the bell dropdown.

#### Scenario: Paginated Welcome Popup
- **WHEN** the dashboard page loads and there are multiple unread `EMERGENTE` alerts
- **THEN** the system SHALL display a single modal containing the first alert and carousel navigation dots
- **AND WHEN** the user clicks "Entendido"
- **THEN** the system SHALL mark that alert as read, update its state, and slide to the next one (or close the modal if none remain)

### Requirement: Warning & Notification Dropdown Categorization
The frontend SHALL display a scrollable popover dropdown when clicking the bell icon. This dropdown displays `AVISO` (with warning styles/icons) and `NOTIFICACION` (with standard styles/icons) alerts. Read alerts (`isRead: true`) SHALL remain visible but rendered in a dimmed/attenuated color scheme.

#### Scenario: Expand Bell Menu
- **WHEN** the user clicks the bell button
- **THEN** the system SHALL open a floating dropdown container aligned with the button
- **AND** it SHALL show unread notifications in full color and read notifications in a dimmed tone

### Requirement: Admin Alert Creation
The system SHALL provide an interface in the `/admin` view to allow administrators to write and post manual alerts to targeted users or roles.

#### Scenario: Admin broadcasts an alert
- **WHEN** an admin posts a new alert from the admin dashboard
- **THEN** the system SHALL create alert records for all matching users in the database
