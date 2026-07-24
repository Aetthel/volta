## Why

Currently, all business dashboards in Volta share a hardcoded Teal color palette, default font sizes, and default border radius settings. Providing customization settings for business-specific themes, text scale levels, and border roundedness allows each salon to match their platform visual identity to their corporate branding.

## What Changes

- Add visual styling attributes (`themeColor`, `fontSizeLevel`, `borderRadiusLevel`) to the `Business` database schema model.
- Add a new "Personalización" configuration section under Business Settings (`/ajustes`) in the frontend.
- Implement backend API routes to update a business's styling preferences.
- Expose styling preferences in the user session/JWT token.
- Dynamically inject CSS Custom Properties (variables) into the root document/layout to control primary colors, font scale factor, and border radius factor based on the active session's business settings.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `business-settings`: Handle customization configuration forms and persistence API.
- `multitenant-core`: Expose customization options in the session context and propagate styling variables to the frontend.
- `reusable-ui-components`: Update UI elements to dynamically scale padding, text sizes, and border-radius using CSS variables.

## Impact

- **Database**: Prisma `schema.prisma` schema changes and database migration.
- **Backend**: Business configuration endpoints and session token callbacks.
- **Frontend**: Global layout (`layout.tsx`), global stylesheets (`globals.css`), settings page (`/ajustes`), and reusable UI components.
