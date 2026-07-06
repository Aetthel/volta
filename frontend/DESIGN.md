---
name: Clinical Elegance
colors:
  surface: "#f8f9fa"
  surface-dim: "#d9dadb"
  surface-bright: "#f8f9fa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4f5"
  surface-container: "#edeeef"
  surface-container-high: "#e7e8e9"
  surface-container-highest: "#e1e3e4"
  on-surface: "#191c1d"
  on-surface-variant: "#3e4949"
  inverse-surface: "#2e3132"
  inverse-on-surface: "#f0f1f2"
  outline: "#6e7979"
  outline-variant: "#bdc9c8"
  surface-tint: "#006a6a"
  primary: "#006565"
  on-primary: "#ffffff"
  primary-container: "#008080"
  on-primary-container: "#e3fffe"
  inverse-primary: "#76d6d5"
  secondary: "#296767"
  on-secondary: "#ffffff"
  secondary-container: "#b0eeed"
  on-secondary-container: "#306e6d"
  tertiary: "#196464"
  on-tertiary: "#ffffff"
  tertiary-container: "#387d7d"
  on-tertiary-container: "#e3fffe"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#93f2f2"
  primary-fixed-dim: "#76d6d5"
  on-primary-fixed: "#002020"
  on-primary-fixed-variant: "#004f4f"
  secondary-fixed: "#b0eeed"
  secondary-fixed-dim: "#94d1d1"
  on-secondary-fixed: "#002020"
  on-secondary-fixed-variant: "#044f4f"
  tertiary-fixed: "#aaefee"
  tertiary-fixed-dim: "#8fd2d2"
  on-tertiary-fixed: "#002020"
  on-tertiary-fixed-variant: "#004f50"
  background: "#f8f9fa"
  on-background: "#191c1d"
  surface-variant: "#e1e3e4"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: "700"
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: "500"
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "500"
    lineHeight: 24px
    letterSpacing: 0.15px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.5px
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
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

This design system is built for a high-end hair salon SaaS, merging the precision of medical-grade software with the sophisticated aesthetics of the beauty industry. The design narrative follows a refined interpretation of **Material Design 3**, emphasizing clarity, hygiene, and efficiency.

The personality is professional, sterile yet welcoming, and highly organized. It aims to evoke a sense of calm reliability for salon owners and stylists managing high-velocity schedules. The visual style utilizes **Corporate Modernism** with a focus on tonal clarity and deliberate whitespace, ensuring that complex scheduling data remains legible and stress-free.

## Colors

The palette is anchored by **Teal (#008080)**, chosen for its psychological association with rejuvenation, cleanliness, and focus.

- **Primary Teal:** Used for key actions, active states, and branding elements.
- **Secondary/Dark Teal:** Reserved for deep navigation elements and high-contrast text.
- **Neutral Grays:** A range of cool-toned grays (`#F8F9FA` to `#E9ECEF`) provides the foundation for the "Medical/Beauty" aesthetic, creating a sterile and modern backdrop.
- **Surface Strategy:** The UI uses a "White-Out" approach where the primary workspace is pure white, while the surrounding interface uses subtle gray transitions to define boundaries without heavy lines.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type scale is strictly hierarchical to facilitate quick scanning of appointment slots and client names.

- **Headlines:** Medium to Bold weights are used for page titles and section headers to provide immediate context.
- **Data Density:** `body-md` and `label-md` are the workhorses of the system, optimized for use within dense data tables and calendar views.
- **Letter Spacing:** Subtle tracking is applied to labels to improve readability in utility-focused components like chips and table headers.

## Layout & Spacing

The layout follows a **Fluid Grid** model with fixed margin constraints for readability.

- **Desktop:** A 12-column grid with a 240px persistent Sidebar (Navigation Rail) on the left. Data tables and calendars expand to fill the remaining horizontal space.
- **Tablets:** The Sidebar collapses into a Navigation Rail (80px) to maximize workspace for scheduling.
- **Mobile:** A single-column layout with 16px side margins. Navigation moves to a Bottom Navigation bar for ergonomic reach.
- **Rhythm:** An 8px linear scale is strictly enforced for all margins, paddings, and component heights to ensure a mathematically clean aesthetic.

## Elevation & Depth

In alignment with Material Design 3, depth is communicated through **Tonal Layers** supplemented by light **Ambient Shadows**.

- **Level 0 (Surface):** The base background, typically the neutral light gray.
- **Level 1 (Cards/Containers):** Pure white surfaces with a very soft, diffused shadow (Blur: 8px, Y: 2px, Opacity: 4% Black) and a 1px border of `#E9ECEF`.
- **Level 2 (Floating Action Buttons):** A more pronounced elevation to signal interactivity. Uses a tinted shadow (Teal at 10% opacity) to create a subtle glow.
- **Level 3 (Modals/Overlays):** High elevation with a scrim background to focus the user’s attention on critical tasks like "New Appointment."

## Shapes

The shape language is **Rounded**, striking a balance between the clinical precision of sharp corners and the friendly approachability of the beauty industry.

- **Buttons & Chips:** Use a full pill-shape (rounded-xl) for a modern, tactile feel.
- **Cards & Data Tables:** Use the standard 0.5rem (8px) corner radius to maintain a structural, organized appearance.
- **Input Fields:** Use a 4px (soft) radius to differentiate functional data entry areas from container elements.

## Components

### Buttons & FABs

- **Primary FAB:** The "Add Appointment" button is a large, circular or extended-pill FAB in Teal, fixed to the bottom right. It uses `on_primary` (White) icons.
- **Action Buttons:** Contained buttons have a 0.5rem radius. Outlined buttons use a 1px Teal border for secondary actions.

### Elevated Cards

- Cards are used to group client info and appointment details. They feature a white background, 8px corner radius, and a subtle Level 1 shadow.

### Navigation Rail/Sidebar

- The Sidebar uses a subtle gray background (`#F8F9FA`) to distinguish it from the white content area. Active states are indicated by a teal vertical bar or a pill-shaped background highlight behind the icon.

### Responsive Data Tables

- Tables utilize `body-md` for row text.
- Headers are sticky, using `label-md` in all-caps with a light gray bottom border.
- Hover states on rows use a very faint teal tint (`#E0F2F2`) to guide the eye.

### Input Fields

- Material-style outlined inputs. The label sits on the border when active. Teal is used for the focus state to provide clear visual feedback during data entry.

### Appointment Chips

- Small, pill-shaped indicators within the calendar. Color-coded by service type (e.g., Haircut = Teal, Coloring = Secondary Teal, Spa = Tertiary Teal) with 12px font size.
