## Why

The current project structure mixes Next.js application files (frontend) with bot logic, database models, and server scripts (backend) in the root directory. As the application grows, this makes it difficult to maintain, scale, and deploy independently. Organizing the codebase into dedicated `frontend` and `backend` directories will improve separation of concerns and development velocity.

## What Changes

- **BREAKING**: Move Next.js application files (`app/`, `components/`, `public/`, `tailwind.config.mjs`, `next.config.mjs`, etc.) into a new `frontend/` directory.
- **BREAKING**: Move bot logic, database configuration, and server scripts (`src/`, `scripts/`, `prisma/`) into a new `backend/` directory.
- **BREAKING**: Update root configuration files (like `docker-compose.yml` and potentially `package.json`) to accommodate or wrap the new workspace structure.
- Update import paths and script commands across the project to reflect the new directory layout.
- Introduce a clear boundary between the web dashboard interface and the WhatsApp bot/API backend.

## Capabilities

### New Capabilities
- `project-modular-structure`: Defines the structural organization of the codebase, boundary rules between frontend and backend, and shared configuration patterns.

### Modified Capabilities
- `multitenant-core`: Update deployment and configuration references due to the structural move of Prisma and backend logic.

## Impact

This is a structural refactor affecting the entire repository. It impacts:
- Docker configuration (`docker-compose.yml`, `Dockerfile`).
- Project run scripts (e.g., `npm run dev`, `npm run bot`).
- Import paths in all frontend components and backend services.
- The Prisma schema location and generated client path.