## Context

To provide quick actions for items (such as client rows in tables or appointment cards in calendar layouts), a context menu is needed. Since no external context menu library is installed, we will implement a robust React-based ContextMenu system using React Portals. This will allow the menu to render cleanly outside scroll wrappers and overflow constraints.

## Goals / Non-Goals

**Goals:**

- Implement a reusable `<ContextMenu>` component suite in `volta-ui.tsx`.
- Enable context menu quick actions on the Client list rows.
- Enable context menu quick actions on Calendar appointment items.
- Enable context menu quick actions on Calendar empty time slot columns.
- Support mobile interactions via custom `long-press` touch event detection.

**Non-Goals:**

- Adding third-party component libraries for context menus (keep bundle sizes lightweight).
- Re-architecting state stores or endpoints (use existing APIs).

## Decisions

### 1. Reusable React Portal-Based Component

We will create:

- `<ContextMenu>`: Context provider containing menu positioning and open states.
- `<ContextMenuTrigger>`: Listens to mouse `onContextMenu` (desktop) and touch events (mobile) to resolve the cursor or touch coordinate position.
- `<ContextMenuContent>`: Renders the options list within a React Portal (`createPortal` on `document.body`) to prevent parent clipping.
- `<ContextMenuItem>`: Single clickable item button inside the menu.
- `<ContextMenuSeparator>`: Visual divider.

### 2. Screen Boundary Auto-Detection

The context menu location will be adjusted dynamically when positioned near screen boundaries.

- If `x + menuWidth > window.innerWidth`, we position the menu from the right (`left = x - menuWidth`).
- If `y + menuHeight > window.innerHeight`, we position the menu from the bottom (`top = y - menuHeight`).

### 3. Long-Press Detection on Mobile

A custom event listener hook or utility timer within `<ContextMenuTrigger>` will listen to `onTouchStart` and `onTouchEnd`.

- A timer is set for 500ms on touch start.
- If touch ends or moves before 500ms, the timer is cleared.
- If the timer fires, we prevent the browser's default context menu and trigger the Volta context menu at the touch coordinates.

## Risks / Trade-offs

- **[Risk]**: Portals might render text out of Next.js hydration context.
  - _Mitigation_: Ensure components only mount on the client side (`mounted` check or checking if `window` exists).
- **[Risk]**: Scrolling the screen while the menu is open could detach the menu from the target element.
  - _Mitigation_: Automatically register a global scroll/resize listener that closes the menu.
