## Context

Multiple files (Inicio dashboard, agenda list, adjustments tab, Alert primitives) contain hardcoded raw hexes and Tailwind slate/emerald/amber colors. We need to align them to the standard variables in `DESIGN.md` (e.g. `primary`, `secondary-container`, `on-surface`, `on-surface-variant`, `outline-variant`, `error`).

## Goals / Non-Goals

**Goals:**
- Clean up all raw hexes `#005d63` and `#b2f1e8` in `inicio/page.tsx` and map them to `primary` and `secondary-container` classes.
- Clean up all raw hexes `#b0c4de` and slate background overrides in `ajustes/page.tsx` and map them to `secondary-container` and `surface-container-low`.
- Standardize status colors in `agenda/page.tsx` and `ajustes/page.tsx` (e.g. active indicators, clock/check statuses) to `primary` and `error` or `on-surface-variant`.
- Clean up `Alert` primitive variants (`success`, `warning`) to map directly to existing theme containers.

**Non-Goals:**
- Creating new theme tokens in `globals.css` or `DESIGN.md`.

## Decisions

### Alert Primitive Color Redefinition
- **Decision:** Modify `success` variant inside `volta-ui.tsx` to use `bg-secondary-container border border-secondary-container/60 text-on-secondary-container`. Modify `warning` variant to use `bg-surface-container border border-outline-variant text-on-surface`.
- **Rationale:** Ensures clean visual presentation of alert states without hardcoded values.

### Hex and Tailwind color classes replacement
- Map `text-[#005d63]` to `text-primary` (corporate Teal).
- Map `bg-[#b2f1e8]/30` to `bg-secondary-container/30` or similar container background.
- Map `text-slate-800` to `text-on-surface` and `text-slate-400` / `text-slate-500` to `text-on-surface-variant`.
- Map `bg-[#b0c4de]/30` / `bg-[#b0c4de]/40` in `ajustes` settings tab to `bg-secondary-container/50` / `bg-secondary-container/70`.

## Risks / Trade-offs

- **Risk:** Minor visual changes in shade density.
  - *Mitigation:* Ensure contrast is clean and complies with the Material Design 3 guidelines.
