# landing-page Specification

## Purpose
This capability covers the clean, modern SaaS-style presentation/landing page for Volta at the root path (`/`). It introduces the product, showcases its features, outlines pricing packages, displays testimonials, and provides FAQs to drive user conversions.

## Requirements

### Requirement: Landing Page Route (`/`)
The system SHALL expose a clean SaaS presentation page at `/` in Spanish, replacing the direct redirect to `/login`.

#### Scenario: Navigating to root displays landing page
- **WHEN** the user visits the root URL `/`
- **THEN** the system renders the SaaS presentation page directly

### Requirement: Sticky Header Navigation
The system SHALL display a sticky header navigation bar with a blur backdrop and thin borders. It SHALL display the brand name "Volta", and navigation links to "Features", "Pricing", and "Testimonials" (hidden on mobile), along with actions for "Login" and "Get Started".

#### Scenario: Navigating via the header links
- **WHEN** the user scrolls the page
- **THEN** the header transitions to a semi-transparent state with a backdrop filter and a shadow

### Requirement: Hero Section with White Placeholder Mockup
The system SHALL present a Hero section with a verified badge ("Estándar Clínico en Belleza"), a main heading, a supportive description, and primary/outlined call-to-action buttons. It SHALL display a clean, white-styled placeholder mockup instead of loading external screenshot assets.

#### Scenario: Responsive layout of the Hero Section
- **WHEN** the layout is loaded on desktop viewports
- **THEN** the text description and the white screenshot placeholder are displayed side-by-side

### Requirement: Social Proof Trust Bar
The system SHALL show a trust bar containing grayscale placeholder logos of elite salons (L'Elegance, Studio 54, Nova Esthetics, DermaClinic, Aura Beauty).

#### Scenario: Grayscale trust logo presentation
- **WHEN** the trust bar is rendered
- **THEN** the logos are displayed with high grayscale filtering and low opacity

### Requirement: Feature Deep-Dive Sections with White Illustrations
The system SHALL render two alternating feature deep-dives:
1. "Agendamiento de Precisión Quirúrgica" for Scheduling
2. "Analítica Clínica para tu Crecimiento" for Analytics
Each section SHALL display descriptive checkmark details and a clean, white container placeholder with a central icon and label text.

#### Scenario: Features rendering with custom outlines
- **WHEN** the feature panels are rendered on screen
- **THEN** the product visuals show up as clean, white, styled placeholder divs with an outline variant border

### Requirement: Tiered Pricing Matrix
The system SHALL feature three pricing tiers: Básico (0€/mes), Pro (29€/mes - highlighted in primary color), and Enterprise (A medida). The tier buttons SHALL utilize standard components from the project.

#### Scenario: Tiered pricing grid
- **WHEN** the pricing section is viewed
- **THEN** the Pro plan card is highlighted using the primary brand color to attract visual attention

### Requirement: Client Testimonials Section
The system SHALL display client quotes alongside their authors (Maria García - Dueña de Volta & Spa, Javier Ruíz - Director de Estética Avanzada) using white circular placeholder templates for their profile pictures.

#### Scenario: Testimonials layout
- **WHEN** the testimonial block is rendered
- **THEN** the author avatars are displayed as white, clean placeholder circles

### Requirement: Interactive FAQ Accordion
The system SHALL display common questions in a toggleable accordion layout. Clicking a question item SHALL toggle the visibility of the corresponding answer.

#### Scenario: Toggling FAQ answers
- **WHEN** the user clicks on an FAQ question item
- **THEN** the corresponding answer is toggled (shown or hidden) with a smooth transition

### Requirement: CTA Section and Multi-Column Footer
The system SHALL show a closing CTA section inviting users to join, and a structured multi-column footer displaying Volta branding, product/company/resource links, copyright ("© 2024 Volta Technologies"), and privacy/terms links.

#### Scenario: Rendering Footer Links
- **WHEN** the footer is rendered
- **THEN** all links redirect to their respective paths under the Volta domain
