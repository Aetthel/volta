## Context

The left color stripe borders on calendar cards will be removed, corner rounding will be reduced, and cards will use solid background colors for categories.

## Goals / Non-Goals

**Goals:**

- Remove left border stripe.
- Set background to `app.colorClass`.
- Apply `rounded-[4px]` and `rounded-[6px]`.
- Use inheritance with opacity for text colors inside cards.

**Non-Goals:**

- Modifying backend models or REST APIs.

## Decisions

- **Decision 1: Sharp corner radius**: Reduce `rounded-md`/`rounded-lg` to `rounded-[4px]` (short events) and `rounded-[6px]` (normal events) to match Google Calendar's sharp layout.
- **Decision 2: Inherit text color**: Service text uses `font-semibold` with default color. Client text uses `opacity-80` or `opacity-90` with default text color to inherit container settings.

## Risks / Trade-offs

<!-- None -->
