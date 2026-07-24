---
name: Clinical Elegance v2
colors:
  surface: "#f8fafa"
  surface-dim: "#d8dada"
  surface-bright: "#f8fafa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f4"
  surface-container: "#eceeee"
  surface-container-high: "#e6e8e9"
  surface-container-highest: "#e1e3e3"
  on-surface: "#191c1d"
  on-surface-variant: "#3e4949"
  inverse-surface: "#2e3131"
  inverse-on-surface: "#eff1f1"
  outline: "#6e7979"
  outline-variant: "#bdc9c8"
  surface-tint: "#006a6a"
  primary: "#006565"
  on-primary: "#ffffff"
  primary-container: "#008080"
  on-primary-container: "#e3fffe"
  inverse-primary: "#76d6d5"
  secondary: "#4c6262"
  on-secondary: "#ffffff"
  secondary-container: "#cce4e4"
  on-secondary-container: "#516767"
  tertiary: "#4c5a78"
  on-tertiary: "#ffffff"
  tertiary-container: "#657392"
  on-tertiary-container: "#faf9ff"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#93f2f2"
  primary-fixed-dim: "#76d6d5"
  on-primary-fixed: "#002020"
  on-primary-fixed-variant: "#004f4f"
  secondary-fixed: "#cfe7e7"
  secondary-fixed-dim: "#b3cbcb"
  on-secondary-fixed: "#081f1f"
  on-secondary-fixed-variant: "#354b4b"
  tertiary-fixed: "#d8e2ff"
  tertiary-fixed-dim: "#b8c6e9"
  on-tertiary-fixed: "#0c1b36"
  on-tertiary-fixed-variant: "#394763"
  background: "#f8fafa"
  on-background: "#191c1d"
  surface-variant: "#e1e3e3"
typography:
  display-lg:
    fontFamily: manrope
    fontSize: 57px
    fontWeight: "700"
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: manrope
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
  headline-md:
    fontFamily: manrope
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
  headline-sm:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  title-lg:
    fontFamily: manrope
    fontSize: 22px
    fontWeight: "500"
    lineHeight: 28px
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-lg:
    fontFamily: inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
  label-sm:
    fontFamily: inter
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  xxl: 3rem
---

## Brand & Style

This design system is built for high-stakes healthcare and professional clinical environments. It balances medical precision with a serene, human-centric approach. The brand personality is authoritative yet accessible, evoking feelings of trust, cleanliness, and modern efficiency.

The aesthetic is **Corporate / Modern** with a strong leaning toward **Minimalism**. It prioritizes clarity and information density without overwhelming the user. By utilizing a rigorous grid and a "Clinical Teal" primary anchor, the system ensures a sterile, professional atmosphere that remains welcoming through subtle tonal variations and refined typography.

## Colors

The palette is anchored by the primary Teal (`#008080`), a color chosen for its historical association with healing and professional stability.

The color architecture follows a "Surface-Container" hierarchy to create depth without relying on heavy shadows.

- **Primary:** Used for key actions and branding highlights.
- **Secondary/Tertiary:** Muted slates and teals used for secondary UI elements and data visualization.
- **Neutral:** A cool-toned gray-teal tint used for backgrounds to reduce eye strain compared to pure white.

Semantic colors (Success, Warning, Error) should maintain the same saturation levels as the primary teal to ensure visual harmony.

## Typography

The typography system uses a dual-font approach to maximize both professionalism and legibility.

- **Manrope** is used for headlines and titles. Its modern, balanced geometric shapes provide a forward-thinking, clean look for navigational and structural elements.
- **Inter** is the workhorse for body text and labels. Its high x-height and neutral design ensure maximum readability for patient data, medical records, and dense informational tables.

For mobile layouts, `headline-lg` scales down to 28px to ensure comfortable viewing on narrow viewports. All text elements use a systematic line-height (1.25x to 1.5x) to prevent crowding.

## Layout & Spacing

This design system utilizes an 8px base unit rhythm to ensure mathematical harmony across all components.

The layout follows a **Fluid Grid** model:

- **Desktop (1440px+):** 12-column grid with 24px (1.5rem) gutters and 32px (2rem) side margins.
- **Tablet (768px):** 8-column grid with 16px (1rem) gutters and 24px (1.5rem) side margins.
- **Mobile (375px):** 4-column grid with 16px (1rem) gutters and 16px (1rem) side margins.

Horizontal spacing between related elements (like an icon and text) should adhere to the `sm` (8px) unit, while vertical section spacing should use `xl` (32px) or `xxl` (48px) to maintain a sense of openness.

## Elevation & Depth

In this design system, depth is primarily conveyed through **Tonal Layers** rather than shadows. This minimizes visual noise and maintains a "flat" clinical efficiency.

- **Background:** The lowest layer, usually pure white or the `neutral` tint.
- **Surface-Container-Low:** Used for large cards or content areas that need a subtle separation from the background.
- **Surface-Container:** The standard tier for interactive cards, lists, and secondary navigation.
- **Surface-Container-High:** Used for elements that require focus, such as active states or tooltips.

When shadows are absolutely necessary (e.g., for modal dialogs), they should be **Ambient Shadows**: highly diffused (20px+ blur), very low opacity (5-10%), and tinted with the primary teal to keep the shadow feeling "clean" rather than "dirty."

## Shapes

The shape language is defined by **Rounded Eight** (0.5rem base). This level of roundedness strikes the perfect balance between the approachability of a rounded system and the professional structure of a sharp system.

- **Standard (0.5rem):** Buttons, Input fields, and small Cards.
- **Large (1rem):** Container blocks, Modals, and Featured banners.
- **Extra Large (1.5rem):** Search bars or "Pill" style buttons when used sparingly for call-to-actions.

All borders should be consistent: 1px width, using the `surface-container-high` color for a "ghost" effect on neutral backgrounds.

## Components

- **Buttons:** Filled buttons use the Primary Teal with white text. Outlined buttons use a 1px border of `surface-container-high` with Primary Teal text. All buttons have 8px (0.5rem) corners.
- **Input Fields:** Use a 1px `surface-container-high` border that transitions to `primary` on focus. Labels use the `label-lg` typography token in a slate-gray color.
- **Cards:** Cards should not have shadows. Use a `surface-container-low` background with a subtle 1px border. For interactive cards, shift the background to `surface-container` on hover.
- **Chips:** Highly rounded (pill-shaped) with a `surface-container` background and `body-md` typography.
- **Lists:** Clean lines with 1px dividers. Use 16px of vertical padding per list item to ensure a comfortable touch target and medical-grade readability.
- **Status Indicators:** Use small, circular dots next to text labels for status (e.g., Active, Pending). These should be high-contrast but small enough not to distract from the data.
