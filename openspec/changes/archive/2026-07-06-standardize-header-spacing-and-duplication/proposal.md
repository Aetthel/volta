## Why

There are spacing and mobile rendering inconsistencies related to the page headers and compact system actions:

1. In `app/inicio/page.tsx`, the `<main>` tag's `gap-gutter` class combines with `PageHeader`'s default `mb-gutter` class, resulting in double spacing below the header, unlike other pages.
2. In `app/agenda/page.tsx`, the calendar control header renders a redundant `<Header />` component (bell and avatar) on mobile, duplicating the avatar and notifications already visible in the `PageHeader` component.

## What Changes

- **Inicio Page Layout Spacing**: Remove `gap-gutter` from the `<main>` container in `app/inicio/page.tsx` and instead apply layout padding/gaps manually below the header block.
- **Agenda Mobile Header Duplication**: Add `hidden md:block` (or equivalent responsive classes) to the compact header actions container in `app/agenda/page.tsx` to prevent avatar/notification duplication on smaller screens.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `stitch-design-migration`: Standardize header layouts and remove redundant action headers in nextjs layouts.

## Impact

- `frontend/app/inicio/page.tsx`
- `frontend/app/agenda/page.tsx`
