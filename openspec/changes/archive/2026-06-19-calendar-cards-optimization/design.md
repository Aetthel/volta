## Context

Currently, `calculateOverlaps` in `frontend/app/agenda/page.tsx` splits overlapping appointments into strict side-by-side columns with locked widths. This causes cards to look squeezed and makes the text unreadable.

## Goals / Non-Goals

**Goals:**

- Enhance `calculateOverlaps` to compute a `colspan` for each event inside a cluster, expanding into rightmost columns when free.
- Reposition overlapping cards horizontally with a slight offset overlap (e.g., 30% width expansion factor) and a neat border/shadow.
- Style the card elements in `frontend/app/agenda/page.tsx` with left colored border stripes and inline short layouts (height <= 45px).
- Enhance hover interaction on cards with scale and elevated z-index.

**Non-Goals:**

- Changing backend/database seed properties.
- Rewriting visual layout structures outside of `agenda/page.tsx`.

## Decisions

- **Decision 1: Event Expansion Algorithm**: Modify `calculateOverlaps` to return `colspan`, `width`, and `left`. It calculates `colspan` by looking ahead at subsequent column lists to check if any event overlaps vertically in time range.
- **Decision 2: Light Cards with Left Color Borders**: Instead of painting full cards with heavy, custom solid colors, we will render a light card background `bg-surface-container-lowest` and set `border-l-[5px]` to `border-l-primary`, `border-l-secondary`, or `border-l-tertiary` using the existing color mapping array.
- **Decision 3: Inline Text for Short Cards**: If height is <= 45px, we combine service and client name with a dot/hyphen inside a single line flexbox row container.

## Risks / Trade-offs

- [Risk] Heavily overlapping events might still look packed.
  - Mitigation: Since the cards can overlap visually and expand when columns are free, they will have significantly more width (typically 20% to 50% more width) than before.
