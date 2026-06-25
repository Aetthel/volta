## ADDED Requirements

### Requirement: Uniform Dashboard Card Headers
The system SHALL ensure that main dashboard cards (such as Citas de Hoy, WhatsApp Bot, and Servicios Solicitados) share a uniform header structure, displaying a Lucide icon aligned with the card title using a consistent flex gap, and avoiding auxiliary items like total counts or subtitles unless explicitly configured.

#### Scenario: Standard header for Citas de Hoy
- **WHEN** the dashboard main page is rendered
- **THEN** the "Citas de Hoy" card header MUST display the CalendarIcon alongside the "Citas de Hoy" title inside the flex header container, without date subtitles or total badges
