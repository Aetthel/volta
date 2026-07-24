## Context

Currently, the root route (`/`) redirects directly to `/login`. To introduce Volta to new visitors, we need a clean, responsive SaaS presentation landing page at `/`. The implementation must reuse Volta's brand theme (clinical modernism, teal, Inter typography) and UI primitives from `volta-ui.tsx`. To keep it focused on layout and structure, all product images will render as clean, white placeholder slots.

## Goals / Non-Goals

**Goals:**

- Render the presentation page at the root route (`/`) in Spanish.
- Structure a clean header, hero section, trust bar, two main feature panels, pricing tiers, testimonials, accordion-based FAQs, and a CTA/footer.
- Reuse tailwind-configured theme tokens and layout metrics (e.g., fluid gutter, container max-width).
- Implement interactive client-side behaviors (sticky nav bar transition on scroll, interactive FAQ accordion).
- Replace all images with clean white containers with borders to focus on layout and structure.

**Non-Goals:**

- Creating actual image/screenshot assets (which will be added in a subsequent phase).
- Integrating backend API routes, live payment workflows, or real authentication sessions on the landing page itself.

## Decisions

### Decision 1: Render Landing Page directly on `frontend/app/page.tsx`

- **Option A**: Keep the redirect at `/` and render the landing page on a path like `/landing` or `/home`.
- **Option B**: Replace the redirect inside `frontend/app/page.tsx` with the landing page React component directly.
- **Choice**: Option B. The standard SaaS entry point is the root domain. By rendering the landing page directly, users see the marketing material first, with standard login links pointing to `/login`.

### Decision 2: Image Replacement Strategy

- **Option A**: Use placeholder image URL services (e.g., placehold.co).
- **Option B**: Use styled HTML divs with borders and/or central descriptive SVG icons.
- **Choice**: Option B. This keeps the design ultra-clean, works completely offline, avoids third-party network dependencies, and matches the "images in white" requirement perfectly.

### Decision 3: FAQ Accordion Toggle State

- **Option A**: Use the native HTML `<details>` and `<summary>` elements.
- **Option B**: Use React state (`useState`) to toggle answer visibility.
- **Choice**: Option B. This allows applying custom animations, transitions, and icons easily with Tailwind.

### Decision 4: Authentication Middleware Configuration

- **Option A**: Allow all routes in middleware by default.
- **Option B**: Specifically add `/` to the public/unauthenticated paths array in `auth.js` / `auth.config.js`.
- **Choice**: Option B. Keeps security tight by only allowing specific public routes (e.g. `/`, `/login`, `/lopd`) and protecting internal features (e.g., `/agenda`, `/clientes`, `/inicio`).

## Risks / Trade-offs

- **[Risk] Middleware redirection loop or access denial**: If middleware intercepts `/` and redirects back to `/login`, visitors will not see the landing page.
  - _Mitigation_: Verify and update next-auth/middleware config to allow unauthenticated access to the root path `/`.
- **[Risk] Duplicate branding references**: The application layout might define a header or footer that conflicts with the custom SaaS design.
  - _Mitigation_: Create a custom page structure inside `/page.tsx` that bypasses shared internal headers/footers, or wrap the internal layouts under route groups (e.g., `(dashboard)/layout.tsx`). Let's check `frontend/app/layout.tsx` for layout encapsulation.
