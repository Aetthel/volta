## Why

The current frontend layout exhibits several user experience (UX) and visual inconsistencies:
1. Widespread lack of visual loading indicators during API fetch cycles in the main dashboard pages, leading to brief flashes of empty state indicators (e.g. showing "No hay clientes" when data is still loading) and layout shifts.
2. Inconsistent naming of the principal administration navigation tab ("Control Global" in Sidebar vs. "Inicio" in BottomNav) for the ADMIN role.
3. Inconsistent header hierarchy on the Calendar view `/agenda` compared to all other dashboard pages, lacking the standardized `<PageHeader>` component.

Fixing these issues will improve the perceived performance, visual cohesiveness, and overall premium feel of the Volta platform.

## What Changes

- **Consistent loading states**: Introduce asynchronous loading states in `/inicio`, `/agenda`, `/clientes`, `/sedes`, and `/admin` views. Utilize the existing `<Skeleton />` component to render layout placeholder animations while fetching database records, preventing layout shifts and avoiding misleading "No data" empty states.
- **Unified Navigation Labels**: Standardize the admin dashboard navigation item name as "Control Global" across both desktop (`Sidebar.tsx`) and mobile (`BottomNav.tsx`) views.
- **Consistent Calendar Header**: Introduce the `<PageHeader>` layout on the `/agenda` route to establish styling uniformity with the other system routes, maintaining compact spacing appropriate for desktop and mobile displays.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `reusable-ui-components`: Extend reusable component rules to mandate loading skeletons for any view fetching asynchronous data on mount.
- `stitch-design-migration`: Ensure consistent section spacings, sidebar/bottom nav naming consistency, and header layout structures across all core pages.

## Impact

- `frontend/components/BottomNav.tsx`: Naming of admin dashboard nav item updated from "Inicio" to "Control Global".
- `frontend/app/agenda/page.tsx`: Integrated `<PageHeader>` component and refactored inner container layout.
- `frontend/app/clientes/page.tsx`, `frontend/app/inicio/page.tsx`, `frontend/app/sedes/page.tsx`, `frontend/app/admin/page.tsx`: Added state hooks for fetching states and integrated visual `<Skeleton />` loaders.
