## Why

The current login page uses a split-screen layout containing temporary welcome graphics and text, which feels cluttered and is not fully optimized for a premium, minimal SaaS feel. We need to replace it with a centered, single-column login interface that utilizes Volta's clinical modernism style, providing a clean login workflow across all screen resolutions.

## What Changes

- **Redesign LoginPage Layout**: Modify `frontend/app/login/page.tsx` to remove the left-side banner column, remove the card container outline borders, and center the authentication form directly on the page background.
- **Form Layout & UI Elements**:
  - Display a clean logo icon at the top, followed by a simple "Iniciar Sesión" title.
  - Render minimalist fields for Email and Password (reusing the visibility eye icon toggle).
  - Maintain standard NextAuth form submission triggers.
  - Show a prominent primary "Iniciar Sesión" button.
  - Render a secondary, outlined "Crear Cuenta Nueva" button below for registration.
  - Align links like "¿Olvidaste tu contraseña?" cleanly.
- **Legal Notice**: Include small legal disclaimer text at the bottom regarding privacy policy and terms of service.

## Capabilities

### New Capabilities

_(None)_

### Modified Capabilities

- `web-authentication`: Redesign the user interface requirements for the login page to use a centered, single-column SaaS structure.

## Impact

- **Login Route**: UI rewrite of `frontend/app/login/page.tsx`.
- **CSS / Primitives**: Heavy usage of `@/components/ui/volta-ui` components (like `Button`, `Field`, `InputGroup`, `Badge`, `Card`, etc.) to stay aligned with design tokens.
