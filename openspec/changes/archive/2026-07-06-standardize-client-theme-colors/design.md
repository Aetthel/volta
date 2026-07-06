## Context

The Volta client management page uses hardcoded colors instead of system theme classes. We need to align all these elements directly with the existing colors defined in `DESIGN.md` (e.g. `primary`, `secondary`, `error`, `on-secondary-container`) to preserve visual integrity.

## Goals / Non-Goals

**Goals:**
- Eliminate hardcoded color classes from `/clientes` pages and related dropdowns/toasts.
- Map LOPD statuses to system theme colors: Aceptado to `primary`, Pendiente to `error`.
- Map Toast banners to secondary container tokens for WCAG accessible contrast.
- Standardize external action icons (WhatsApp) to the `primary` theme.

**Non-Goals:**
- Modifying the `globals.css` file or introducing new success/warning colors.
- Changing database schemas or API response formats.

## Decisions

### Mapping Status and Action Colors
- **Decision:** Map LOPD Aceptado to `text-primary` and LOPD Pendiente to `text-error`. Map WhatsApp icons to `text-primary`.
- **Alternative considered:** Keep them neutral or add custom colors.
- **Rationale:** Aligns with existing colors in `DESIGN.md` while avoiding custom CSS extensions.

### Toast Alert Redesign
- **Decision:** Style toast alerts using `bg-secondary-container text-on-secondary-container` container classes, with icons in `text-secondary` and secondary text using opacity `text-on-secondary-container/80`.
- **Rationale:** Ensures clean contrast and color harmony on the container cards without using hardcoded shades of green.

## Risks / Trade-offs

- **Risk:** Contrast issues if primary or secondary colors change.
  - *Mitigation:* The design system uses token pairs (e.g., `secondary-container` and `on-secondary-container`) which always guarantee contrast safety.
