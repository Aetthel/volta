## Why

Overlapping calendar cards in `/agenda` currently look rigid, squeeze text excessively, and are hard to read. We want to implement an event expansion and slight horizontal overlap algorithm similar to Google Calendar, along with inline layouts for short events, a left colored stripe indicator, and interactive pop-to-front behavior on hover.

## What Changes

- Implement a `colspan` calculation in `calculateOverlaps` to let events expand into empty columns.
- Implement a slightly overlapping left/width positioning algorithm to allow cards to overlap horizontally.
- Redesign event cards to feature a 5px left colored border (`border-l-[5px]`) corresponding to the service type, using light container backgrounds (`bg-surface-container-lowest`).
- Introduce inline single-line layout for short events (height <= 45px) combining service and client names.
- Add interactive scale and z-index elevation on hover (`hover:z-30 hover:scale-[1.03]`).

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `appointment-management`: Optimización del posicionamiento de citas solapadas, layouts compactos y pop-to-front.

## Impact

- `frontend/app/agenda/page.tsx`
