## ADDED Requirements

### Requirement: Centered Minimalist SaaS Login Layout
The login interface SHALL render as a flat, single-column centered layout directly on the viewport background, without any surrounding container card, borders, or shadows. It SHALL display the brand logo icon, page header title ("Iniciar Sesión"), inputs using inline placeholders ("Correo electrónico" and "Contraseña") instead of separate text labels above them (with a show/hide password visibility toggle), a primary "Iniciar Sesión" button, links for resetting password, a secondary outline button for creating a new account, and a small disclaimer footer at the bottom.

#### Scenario: Form alignment on different resolutions
- **WHEN** the login page is loaded on any viewport (mobile, tablet, or desktop)
- **THEN** the login form elements are vertically and horizontally centered on the viewport in a flat, borderless structure

