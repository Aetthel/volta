## Context

The dashboard (`/inicio`) consists of a top stats bar, today's appointments list on the left, and WhatsApp Bot status and Popular Services cards on the right. These columns are currently configured with a rigid `lg:h-[560px]` height, causing empty spaces or overlapping QR codes when WhatsApp is disconnected. We need a fluid layout where height is computed naturally based on content and columns split at `md` resolution (tablets).

## Goals / Non-Goals

**Goals:**
- Restructure layout grid to `md:grid-cols-10` with `md:col-span-6` for appointments and `md:col-span-4` for utilities.
- Remove fixed height constraints and vertical scroll controls inside individual cards, adapting them to natural height flows.
- Guarantee fully responsive design on mobile, tablet, and desktop screens.

**Non-Goals:**
- Modifying backend models or REST APIs.
- Adding new external packages or styling libraries.

## Decisions

- **Decision 1: Natural height layout**: Instead of forcing items to stretch and scroll in bounded containers, let the page overflow naturally on the Y-axis. This guarantees that whether the WhatsApp bot is connected or showing a QR code, all information is rendered perfectly without clipping or bleeding outside the cards.
- **Decision 2: Responsive breakpoint adjustment**: Apply `md:` responsive grid splitting (starting at 768px instead of `lg:` 1024px) to ensure tablet layout (e.g. iPad) looks correct in landscape or portrait orientation, with mobile gracefully collapsing to 1 column.

## Risks / Trade-offs

- [Risk] Page height might grow long if today's appointments list is very long.
  - Mitigation: On a normal working day, the total list size is between 1-10 elements, which is compact. If it grows very long, the vertical scroll of the main viewport is completely standard and works fine.
