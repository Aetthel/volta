---
name: Organic Vitality
colors:
  surface: '#f6fce1'
  surface-dim: '#d7ddc3'
  surface-bright: '#f6fce1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f7dc'
  surface-container: '#eaf1d6'
  surface-container-high: '#e5ebd0'
  surface-container-highest: '#dfe5cb'
  on-surface: '#181e0d'
  on-surface-variant: '#444939'
  inverse-surface: '#2d3321'
  inverse-on-surface: '#edf4d9'
  outline: '#747967'
  outline-variant: '#c4c9b4'
  surface-tint: '#496800'
  primary: '#476500'
  on-primary: '#ffffff'
  primary-container: '#5d7f13'
  on-primary-container: '#faffe7'
  inverse-primary: '#add461'
  secondary: '#676014'
  on-secondary: '#ffffff'
  secondary-container: '#efe58b'
  on-secondary-container: '#6d661a'
  tertiary: '#5a5d56'
  on-tertiary: '#ffffff'
  tertiary-container: '#72766e'
  on-tertiary-container: '#fbfdf4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8f17a'
  primary-fixed-dim: '#add461'
  on-primary-fixed: '#131f00'
  on-primary-fixed-variant: '#364e00'
  secondary-fixed: '#efe58b'
  secondary-fixed-dim: '#d2c972'
  on-secondary-fixed: '#1f1c00'
  on-secondary-fixed-variant: '#4e4800'
  tertiary-fixed: '#e1e3db'
  tertiary-fixed-dim: '#c5c7bf'
  on-tertiary-fixed: '#191d17'
  on-tertiary-fixed-variant: '#444841'
  background: '#f6fce1'
  on-background: '#181e0d'
  surface-variant: '#dfe5cb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style
This design system centers on an organic, revitalizing aesthetic tailored for health, wellness, and specialized clinical environments. It transitions the traditional clinical coldness into a space of growth and natural balance. The target audience includes wellness seekers and practitioners who value clarity, professional rigor, and a restorative atmosphere. 

The visual style is a blend of **Modern Minimalism** and **Tactile Softness**. It utilizes generous whitespace and a restricted, nature-inspired palette to ensure high cognitive legibility. By combining systematic precision with organic tones, the UI evokes a sense of calm, renewal, and "clinical elegance" without the sterility of standard medical interfaces.

## Colors
The palette is rooted in an **Olive Sage (#6B8E23)**, serving as the primary brand anchor for high-intent actions and structural accents. This green provides a grounded, authoritative feel that remains connected to nature. 

A **Lemon Yellow (#F0E68C)** acts as a soft accent, used sparingly for secondary highlights, subtle warnings, or illustrative elements to inject a sense of optimism. The background uses a tinted **Off-White (#F9FBF2)** to reduce eye strain and maintain the organic warmth, while the text utilizes a **Deep Moss (#2D3321)** instead of true black to keep the contrast high yet soft.

## Typography
This design system exclusively utilizes **Inter** to maintain a systematic, utilitarian, and professional tone. The typeface is optimized for readability in data-heavy clinical contexts. 

Headlines use tighter letter-spacing and slightly heavier weights to establish a clear hierarchy. Body text is prioritized for comfort, utilizing a generous 1.5–1.6 line-height to ensure long-form medical or instructional content is easily digestible. Labels and metadata use increased tracking and medium weights to remain distinct from body content.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on an 8px spatial rhythm. This ensures all components scale predictably and maintain visual harmony. 

- **Desktop:** A 12-column grid with 24px gutters and 64px side margins. 
- **Tablet:** An 8-column grid with 16px gutters and 32px side margins.
- **Mobile:** A 4-column grid with 16px gutters and 16px side margins.

Content is organized within clear vertical modules, using white space as a primary tool for grouping related information. Vertical rhythm is strictly enforced through the 8px base unit.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than aggressive shadows. Surfaces are stacked to create a physical hierarchy that feels like paper or natural materials.

1.  **Base (Level 0):** The primary canvas using the off-white tinted background.
2.  **Raised (Level 1):** Elements like cards or navigation bars use a pure white background with a very soft, diffused 10% opacity primary-tinted shadow (Sage-tinted) to indicate lift.
3.  **Overlay (Level 2):** Modals and popovers use a subtle backdrop blur (12px) to focus the user’s attention, maintaining the "glassmorphism" feel without excessive transparency.

Outlines are preferred over shadows for input fields and interactive containers, using a low-contrast version of the primary sage color.

## Shapes
In alignment with the "Round Eight" philosophy, the design system utilizes a **Rounded** shape language. This softens the clinical nature of the interface, making it feel approachable and safe.

The default corner radius for standard components (buttons, inputs) is **0.5rem (8px)**. For larger containers and cards, the radius increases to **1rem (16px)**. This consistent rounding mimics organic forms and avoids the harshness associated with standard grid-based software.

## Components
- **Buttons:** Primary buttons are solid Sage Green (#6B8E23) with white text. Secondary buttons use an outline of the primary color or a light Lemon Yellow fill for low-priority calls to action.
- **Input Fields:** Use a 1px border in a muted sage-grey. On focus, the border thickens and glows with a soft Lemon Yellow aura.
- **Cards:** White background with an 8px radius and a 1px soft-olive border. No heavy shadows; use a 2px vertical offset shadow for a "lifted" state on hover.
- **Chips & Tags:** Use high-desaturation versions of the primary and accent colors (e.g., a very pale sage background with dark sage text) to indicate status or categories.
- **Progress Indicators:** Linear bars use the Lemon Yellow for the track and Sage Green for the progress fill to emphasize growth and completion.
- **Navigation:** Top-tier navigation uses a clean, white bar with a subtle bottom border in pale sage. Active states are indicated by a 2px Sage Green underline.