## MODIFIED Requirements

### Requirement: Tiered Pricing Matrix

The system SHALL feature updated monthly pricing tiers: Básico (18€/mes), Pro (25€/mes - highlighted in primary color), and Enterprise (A medida). For unauthenticated visitors, the tier action buttons SHALL direct to registration with the preselected plan. For authenticated business owners, the tier action buttons SHALL directly trigger the multi-step subscription checkout modal.

#### Scenario: Tiered pricing grid

- **WHEN** the pricing section is viewed
- **THEN** the Pro plan card is highlighted using the primary brand color with updated monthly pricing (25€/mes) and clear feature checklists.

#### Scenario: Interacting with pricing CTAs
- **WHEN** an authenticated user clicks a plan's action button on the landing page
- **THEN** the multi-step checkout modal opens with the selected plan configured.
