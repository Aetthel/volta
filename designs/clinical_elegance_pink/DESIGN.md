---
name: Clinical Elegance Pink
colors:
  surface: "#f8f9ff"
  surface-dim: "#ccdbf4"
  surface-bright: "#f8f9ff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#eff4ff"
  surface-container: "#e5eeff"
  surface-container-high: "#dce9ff"
  surface-container-highest: "#d4e4fc"
  on-surface: "#0d1c2e"
  on-surface-variant: "#524343"
  inverse-surface: "#223144"
  inverse-on-surface: "#eaf1ff"
  outline: "#857372"
  outline-variant: "#d7c2c1"
  surface-tint: "#8a4d4e"
  primary: "#8a4d4e"
  on-primary: "#ffffff"
  primary-container: "#d48c8c"
  on-primary-container: "#592628"
  inverse-primary: "#ffb3b3"
  secondary: "#545f72"
  on-secondary: "#ffffff"
  secondary-container: "#d5e0f7"
  on-secondary-container: "#586377"
  tertiary: "#615d5e"
  on-tertiary: "#ffffff"
  tertiary-container: "#a39e9e"
  on-tertiary-container: "#393536"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdad9"
  primary-fixed-dim: "#ffb3b3"
  on-primary-fixed: "#380c0f"
  on-primary-fixed-variant: "#6e3637"
  secondary-fixed: "#d8e3fa"
  secondary-fixed-dim: "#bcc7dd"
  on-secondary-fixed: "#111c2c"
  on-secondary-fixed-variant: "#3c475a"
  tertiary-fixed: "#e8e1e1"
  tertiary-fixed-dim: "#cbc5c5"
  on-tertiary-fixed: "#1d1b1b"
  on-tertiary-fixed-variant: "#494646"
  background: "#f8f9ff"
  on-background: "#0d1c2e"
  surface-variant: "#d4e4fc"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: "600"
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "500"
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
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
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system balances clinical precision with a compassionate, high-end aesthetic. It is tailored for healthcare professionals and patients who value both medical reliability and emotional well-being. The style is **Minimalist with Subtle Tactile Depth**, utilizing generous whitespace and a refined color palette to reduce cognitive load and evoke a sense of calm. The atmosphere is professional, sophisticated, and approachable, moving away from the coldness of traditional medical software toward a warmer, human-centric experience.

## Colors

The palette is centered around a soft, sophisticated rose-pink (`#D48C8C`) which serves as the primary brand anchor, providing warmth and a "human touch" to clinical data.

- **Primary**: Used for key actions, active states, and brand signifiers.
- **Secondary**: A deep charcoal slate used for secondary navigation and high-contrast text to ensure professional grounding.
- **Tertiary**: A very soft pink-tinted off-white used for large background surfaces to soften the overall UI.
- **Neutral**: Greyscale tones with a slight cool bias to maintain a clean, sterile, and professional environment.
- **Semantic**: Success (sage green), Warning (muted amber), and Error (deep terracotta) are desaturated to match the sophisticated tone of the system.

## Typography

The system uses **Inter** exclusively to leverage its systematic, utilitarian nature. To maintain the "Elegance" aspect, we employ tight tracking on display headings and generous line-heights for body text to ensure readability in high-stress medical contexts.

Headlines should be used sparingly to define clear sections. Labels are capitalized and tracked out slightly to differentiate them from actionable body text. All typography follows a strict vertical rhythm to ensure data-heavy layouts remain scannable.

## Layout & Spacing

The design system utilizes a **12-column fixed grid** for desktop (max-width 1440px) and a **4-column fluid grid** for mobile.

- **Desktop**: 24px gutters with 48px outside margins.
- **Tablet**: 16px gutters with 32px outside margins.
- **Mobile**: 16px gutters with 16px outside margins.

Spacing follows an 8px base unit. Vertical rhythm is critical; maintain 24px (spacing-md) between standard components and 40px (spacing-lg) between distinct content sections. Use "safe areas" around data visualizations to prevent visual clutter.

## Elevation & Depth

Depth is created through **Tonal Layers** rather than heavy shadows. The primary background is the Tertiary color (`#F8F1F1`), while cards and containers are pure white (`#FFFFFF`).

- **Surface Level 0**: Tertiary background.
- **Surface Level 1**: White cards with a 1px soft-grey border (`#E2E8F0`).
- **Surface Level 2**: Soft, ambient shadows (Blur: 12px, Y: 4px, Color: `#00000008`) used only for active overlays or modals.

This low-contrast approach maintains the clinical "flat" look while providing enough visual hierarchy to distinguish between navigation, content, and utility panels.

## Shapes

The shape language follows a "Round Eight" philosophy. All standard UI containers, buttons, and input fields use a **0.5rem (8px)** base radius.

- **Small elements (tags/chips)**: Use 4px (rounded-sm).
- **Standard elements (cards/buttons)**: Use 8px (rounded-md).
- **Large elements (modals/drawers)**: Use 16px (rounded-lg).

This consistent rounding softens the interface, making the medical environment feel less rigid and more supportive.

## Components

- **Buttons**: Primary buttons are solid `#D48C8C` with white text. Secondary buttons use a 1px border of the primary color with pink text. Buttons have a fixed height of 48px for high touch-targets.
- **Chips**: Used for status indicators. Use a desaturated background version of the primary color with dark text for "active" or "selected" states.
- **Lists**: Data rows should have 16px vertical padding with a 1px hairline separator. On hover, rows transition to a subtle white background with a soft elevation effect.
- **Inputs**: Field borders use a neutral `#CBD5E0`. On focus, the border shifts to `#D48C8C` with a 2px outer "glow" using the primary color at 10% opacity.
- **Cards**: Use 24px internal padding. Card headers should be separated by a thin horizontal rule or a subtle tonal shift in the header background.
- **Checkboxes & Radios**: Utilize the primary color for the checked state. Maintain the 8px corner radius for checkboxes where possible (or 4px for smaller scale) to match the system shape language.
