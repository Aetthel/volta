## Context

The Volta project currently hosts all logic within a single root directory. This includes a Next.js application for the dashboard and authentication, a WhatsApp bot implementation using `whatsapp-web.js`, Prisma ORM configurations, and various server scripts. As the system scales to handle multiple tenants and complex bot workflows, this monolithic folder structure becomes difficult to navigate, creates intertwined dependencies, and complicates independent deployments (e.g., deploying the Next.js app to Vercel/Vps and the Bot to a long-running Node container).

## Goals / Non-Goals

**Goals:**

- Clearly separate user interface code (Next.js) from backend/bot logic.
- Implement an NPM Workspaces (Monorepo) architecture or clear directory boundaries (`/frontend`, `/backend`).
- Update all tooling, linting, and Docker configurations to support the split structure.
- Ensure the Prisma ORM client can be shared seamlessly between the frontend and backend without duplicating code.

**Non-Goals:**

- Completely rewriting existing business logic or components.
- Changing the underlying technologies (still using Next.js, NextAuth, whatsapp-web.js, Prisma).
- Splitting the Postgres database (the system remains a single shared database).

## Decisions

1. **Monorepo vs Folders**: We will implement an NPM Workspace setup. A root `package.json` will define `"workspaces": ["frontend", "backend"]`. This provides native support for hoisting dependencies and simplifies dependency management while maintaining strict boundary separation.
2. **Prisma Location**: The `prisma` folder will be moved to the `backend` workspace (or a dedicated `packages/db` workspace if needed). The frontend will consume the Prisma client exported by the backend workspace to ensure a single source of truth for the database schema. For simplicity in the initial split, we will keep Prisma inside the `backend` workspace and export the `db.js` file.
3. **Docker Compose**: The `docker-compose.yml` will be updated to point the `app` build context to the root but might define separate services for the Next.js dashboard (`frontend`) and the WhatsApp bot (`backend`), though currently both might run together if we use a single entrypoint. For now, we will separate them logically so `npm run dev` in frontend runs Next.js, and `npm run dev` in backend runs the bot.

## Risks / Trade-offs

- **Risk: Breaking imports** → Moving files will inevitably break hundreds of imports. _Mitigation:_ Rely heavily on TypeScript/JS tooling and thorough search-and-replace using the IDE or script capabilities.
- **Risk: Prisma Client Sharing** → Next.js edge/serverless environments sometimes struggle with hoisted Prisma clients. _Mitigation:_ Ensure `next.config.mjs` has the correct `transpilePackages` or `outputFileTracing` settings if deploying outside Docker. In Docker, standard Node.js resolution will work.
- **Risk: NextAuth paths** → NextAuth might depend on environment variables relative to the project root. _Mitigation:_ Move the `.env` file to the workspace root and use tools like `dotenv-cli` or ensure Docker propagates the variables appropriately to both workspaces.
