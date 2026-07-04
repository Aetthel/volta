## Why
Volta currently redirects the root route (`/`) immediately to the login screen, which doesn't allow prospective users or visitors to learn about the platform. We need a clean, SaaS-style landing/presentation page at `/` to showcase Volta's features, pricing, testimonials, and FAQs, projecting a high-end "clinical elegance" brand image.

## What Changes
- **Change `/` Route Behavior**: Modify `frontend/app/page.tsx` to directly render the presentation landing page instead of redirecting immediately to `/login`.
- **Implement SaaS Landing Page**: Design and code a responsive, clean SaaS presentation using:
  - Sticky header navigation with links to Features, Pricing, Testimonials, and buttons for Login/Get Started.
  - A Hero section featuring a verified badge ("Estándar Clínico en Belleza"), tagline, action buttons, and a clean white placeholder container (instead of a static dashboard screenshot).
  - A trust bar showing grayscale placeholder logos of elite salons.
  - Alternating layout deep-dive sections for Precision Scheduling ("Agendamiento de Precisión Quirúrgica") and Clinical Analytics ("Analítica Clínica para tu Crecimiento"), with clean white illustration placeholders.
  - A 3-column tiered pricing section (Básico, Pro - highlighted, Enterprise) using project buttons.
  - A testimonials carousel/grid showcasing client reviews with empty profile placeholders.
  - An interactive FAQ accordion with smooth toggles.
  - A brand-aligned call to action section and structured multi-column footer with legal and copyright sections under the name Volta.

## Capabilities

### New Capabilities
- `landing-page`: Renders a clean, responsive SaaS presentation page at the root path (`/`) showcasing features, pricing, testimonials, FAQs, and legal terms under the Volta brand.

### Modified Capabilities
*(None. The requirements for existing capabilities remain unchanged.)*

## Impact
- **Routing**: `frontend/app/page.tsx` will no longer redirect to `/login` by default.
- **Frontend Components**: Creation of a landing page layout and modular sub-sections in `frontend/app/` using primitives from `volta-ui.tsx` and utility functions.
- **Design Tokens**: Standard CSS variables/classes defined in `globals.css` (Tailwind CSS 4) will be heavily utilized for spacing, colors, and typography.
