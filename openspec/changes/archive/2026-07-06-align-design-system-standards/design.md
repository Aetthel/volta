## Context

Multiple discrepancies between the code implementation and the `DESIGN.md` guidelines need to be standardized. These cover primary theme colors, component border-radii, custom chart/list decorations, and duplicated notification toast alerts.

## Goals / Non-Goals

**Goals:**

- Update `--color-primary` and `--color-primary-container` in `globals.css` to `#006565` and `#008080`.
- Update primitive inputs (`FloatingInput`, `Select`, `Textarea`) to use `rounded-sm`.
- Update `Card` container to use `rounded-default`.
- Replace hardcoded hex codes `#005d63` and `#b2f1e8` in `MetricCard`, `WeeklyPerformanceChart`, `FeaturedServicesList`, and `UpcomingAppointmentsList` with semantic variables.
- Standardize the notification toast overlay inside `NewAppointmentModal.tsx`.

**Non-Goals:**

- Scaling base typography fonts down to 16px (the zoomed-in 18px base is an intentional user choice and will be preserved).

## Decisions

### Inputs and Cards Border Radius

- **Decision:** Change input components border-radius classes from `rounded-md` (12px) to `rounded-sm` (4px). Change Card component from `rounded-2xl` (24px) to `rounded-default` (8px).
- **Rationale:** Aligns exactly with the shape rules specified in `DESIGN.md` (4px inputs for data entry differentiation, 8px cards for organized structural appearance).

### Toast standardisation

- **Decision:** Modify `NewAppointmentModal.tsx` toast alert inline layout to use `bg-secondary-container text-on-secondary-container border border-outline-variant/60` and map text/icon to secondary colors, mirroring the `clientes` page logic.
- **Rationale:** Ensures design duplication is eliminated.

## Risks / Trade-offs

- **Risk:** Existing custom styles could overflow if cards are smaller due to lower border-radius.
  - _Mitigation:_ The 8px border-radius provides more internal workspace area, so elements will actually have more space, reducing overflow risk.
