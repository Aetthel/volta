## Context
The current login page uses a split-pane layout with a visual banner. To move towards a clean, centered SaaS aesthetic, we will redesign the login page to be a centered single-column card layout. The login authentication logic and routes remain unchanged.

## Goals / Non-Goals

**Goals:**
- Center the login form elements horizontally and vertically on the screen for all resolutions.
- Show a brand icon logo, title, email/password fields, and a primary login button.
- Place a secondary outline button for creating a new account within the centered flow.
- Add small disclaimer/legal text at the bottom.

**Non-Goals:**
- Modifying authentication callback routes, credentials verification logic, or database prisma actions.
- Designing a new signup/registration page workflow.

## Decisions

### Decision 1: Centering Layout Structure
- **Choice**: Use a flex column container with `min-h-screen items-center justify-center bg-surface px-6 py-12` and wrap the form elements in a `max-w-[440px] w-full` flat structure without any card outline borders.

### Decision 2: Register/Signup Button Position
- **Choice**: Move the "Regístrate ahora" link from the top right into the central flow as a full-width outlined button: "Crear Cuenta Nueva". This matches the screenshot's layout structure.


## Risks / Trade-offs

- **[Risk] Responsive overflow**: If the viewport height is very small, a centered card layout can get cut off at the top/bottom.
  - *Mitigation*: Ensure the main container uses `min-h-screen py-12 overflow-y-auto` so it can be scrolled if the screen height is too small.
