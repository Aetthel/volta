## Why

The user wants to remove the left color border from calendar cards, make them solid-colored blocks, and reduce the border radius to make them sharper, resembling Google Calendar.

## What Changes

- Remove the left colored border stripe from the calendar cards in `frontend/app/agenda/page.tsx`.
- Restore solid category background colors (`app.colorClass`) as the default background for each card.
- Reduce the corner rounding from `rounded-md`/`rounded-lg` to sharp `rounded-[4px]` / `rounded-[6px]`.
- Align text typography to inherit the container's high-contrast colors dynamically with opacity.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `appointment-management`: Ajustes estéticos en las tarjetas de cita (fondos sólidos y menor border-radius).

## Impact

- `frontend/app/agenda/page.tsx`
