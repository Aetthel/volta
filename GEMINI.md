# Volta Project Standards

This project follows strict UI and architectural standards to ensure quality, scalability, and consistency.

## UI Standards (shadcn/ui & Volta UI)

We use **shadcn/ui** for generic components and **Volta UI** for the core branded interface.
Standard design tokens and principles are documented in: `frontend/DESIGN.md`

- **Visual Style**: Volta UI "Zoomed-In" (Base 18px, Lighter font weights).
- **Typography**: Prefer `semibold`/`medium`. Avoid `black`/`bold` on large elements.
- **Components**: Use atomic Volta components from `frontend/components/ui/volta-ui.js`.
- **Form Layout**: Always use `FieldGroup` and `Field`. Never use raw `div` with `space-y-*`.
- **Inputs**: Use `InputGroup` for inputs with addons or buttons.
- **Composition**: Use full Card composition (`CardHeader`, `CardContent`, etc.).
- **Spacing**: Prefer `gap-*` over `space-x-*`/`space-y-*`.
- **Icons**: Use `data-icon` attribute for icons in buttons. No sizing classes on icons.
- **Components**: Prefer existing components (`Alert`, `Empty`, `Badge`, `Separator`, `Skeleton`) over custom markup.

Reference: [.agents/skills/shadcn/SKILL.md](.agents/skills/shadcn/SKILL.md)

## Development Workflow

- **Research**: Always check existing components and registries before building custom UI.
- **Docs**: Run `npx shadcn@latest docs <component>` to verify APIs before implementation.
- **Validation**: Ensure accessibility (e.g., `DialogTitle` is mandatory) and semantic tokens are used.

## Tech Stack

- **Framework**: Next.js (App Router) in `/frontend`
- **Backend**: Node.js + Express + whatsapp-web.js in `/backend`
- **Monorepo**: NPM Workspaces
- **Styling**: Tailwind CSS v4
- **Primitives**: @base-ui/react (Nova style)
- **Icons**: Lucide
- **Database**: Prisma + PostgreSQL (Schema in `/backend/prisma`)
- **Auth**: NextAuth.js
