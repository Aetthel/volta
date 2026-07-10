---
name: Warm Sand
colors:
  surface: '#fff8f4'
  surface-dim: '#e1d8d3'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ec'
  surface-container: '#f5ece6'
  surface-container-high: '#efe6e1'
  surface-container-highest: '#eae1db'
  on-surface: '#1f1b18'
  on-surface-variant: '#54433e'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efe9'
  outline: '#87736c'
  outline-variant: '#dac1ba'
  surface-tint: '#934930'
  primary: '#934930'
  on-primary: '#ffffff'
  primary-container: '#d17a5d'
  on-primary-container: '#501703'
  inverse-primary: '#ffb59d'
  secondary: '#645d56'
  on-secondary: '#ffffff'
  secondary-container: '#ebe1d8'
  on-secondary-container: '#6a635c'
  tertiary: '#5f5e5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#92918d'
  on-tertiary-container: '#2a2a27'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#76331b'
  secondary-fixed: '#ebe1d8'
  secondary-fixed-dim: '#cec5bc'
  on-secondary-fixed: '#1f1b16'
  on-secondary-fixed-variant: '#4c463f'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fff8f4'
  on-background: '#1f1b18'
  surface-variant: '#eae1db'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is crafted for premium hair salon management, blending high-end hospitality with efficient SaaS utility. The brand personality is organic, nurturing, and professional. It prioritizes a tactile, human experience over cold, digital efficiency, ensuring that salon owners feel a sense of calm and order.

The design style is a refined **Minimalism** enriched with **Tonal Layering**. It avoids harsh shadows in favor of subtle color shifts and soft edges to evoke the feeling of natural materials like linen, stone, and terracotta. The interface should feel "breathable," utilizing generous whitespace to reflect the premium, unhurried atmosphere of a luxury salon.

## Colors

The palette is rooted in earth tones to create a welcoming, "Warm Sand" atmosphere.

*   **Primary (Terracotta):** Used for key actions, focus states, and brand-identifying moments. It provides a sophisticated pop of color against the neutral base.
*   **Secondary (Soft Beige):** Used for container backgrounds, hover states, and subtle UI divisions. It softens the interface compared to pure white.
*   **Tertiary (Warm White):** The primary canvas color. It is a "paper" white that reduces eye strain and feels more organic than #FFFFFF.
*   **Neutral (Charcoal Stone):** A warm-toned dark grey used for typography and icons to ensure high legibility while maintaining the organic palette.

## Typography

This design system utilizes **Inter** across all levels to maintain a clean, professional, and highly legible appearance. While the palette is organic, the typography remains systematic and utilitarian to handle complex scheduling and inventory data.

To elevate the "Premium" feel, display headings use tighter letter spacing and semi-bold weights. Body text preserves a standard height for maximum readability during long management sessions. All type is rendered in the Neutral (Charcoal Stone) color to maintain a soft but high-contrast relationship with the warm backgrounds.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to ensure a curated, editorial feel, while transitioning to a **Fluid Grid** on mobile devices. 

*   **Desktop:** A 12-column grid with a max-width of 1280px. Gutters are fixed at 24px to allow elements breathing room.
*   **Mobile:** A 4-column grid with 16px side margins. 
*   **Rhythm:** An 8px linear scale governs all padding and margins. Vertical rhythm is generous; components are never crowded, reflecting the "Elegance" of the salon space.

## Elevation & Depth

In this design system, depth is conveyed through **Tonal Layers** rather than heavy shadows. 

1.  **Level 0 (Base):** The Tertiary (Warm White) surface.
2.  **Level 1 (Cards/Containers):** Secondary (Soft Beige) surfaces with a subtle 1px border in a slightly darker beige tint.
3.  **Level 2 (Popovers/Modals):** Pure white surfaces with a very soft, highly diffused ambient shadow (Color: Primary tint, Alpha: 5%, Blur: 20px).

This approach maintains a "flat-tactile" aesthetic that feels modern and approachable.

## Shapes

The shape language is consistently **Rounded**. This eliminates "sharpness" from the UI, contributing to the organic and friendly brand personality. 

*   Standard components (Buttons, Inputs) use the base **0.5rem (8px)** radius.
*   Cards and larger containers use **1rem (16px)** to create a nested, softer appearance.
*   Search bars and tags may utilize the **3 (Pill-shaped)** style to differentiate them as interactive or dismissible tokens.

## Components

*   **Buttons:** Primary buttons are solid Terracotta with white text. Secondary buttons use a Soft Beige fill with Neutral text. No heavy borders; let the color shapes define the hit area.
*   **Input Fields:** Use a subtle Soft Beige background with a bottom-only or light 1px border. Focus state moves the border to Terracotta.
*   **Chips:** Pill-shaped with a Soft Beige background. Active chips use a light Terracotta tint with Terracotta text.
*   **Cards:** Use 16px padding and 16px corner radius. Backgrounds should be a step darker than the page surface to create a "recessed" or "elevated" feel without shadows.
*   **Lists:** High-density lists (for client rosters) use horizontal dividers in a very pale beige. Row hover states should use a subtle Tertiary-to-Secondary color shift.
*   **Specialty Components:** 
    *   *Booking Calendar:* Use soft, rounded blocks for appointments.
    *   *Status Indicators:* Use muted, earthy versions of green/red/yellow to stay within the organic palette.