## Why

The backend entrypoint (`backend/src/index.js`) currently mixes Express routing, configuration checking, cron job scheduling, and mock database seeding. This coupling hinders codebase readability, complicates test isolation, and slows down local startup configuration management. To improve the codebase's scalability and follow clean code standards, these concerns should be separated into dedicated initialization, configuration, and data-seeding files.

## What Changes

- **Extract database seeding**: Extract the `ensureMockBusinessesExist` and other client/appointment mock seeding logic from `backend/src/index.js` into a separate initialization/seeding script (e.g. Prisma seeding, or a dedicated setup module).
- **Centralize backend configuration**: Centralize environmental variables validation and loading into a single configuration/environment manager rather than reading `process.env` directly throughout different parts of `index.js`.
- **Refactor entrypoint routing**: Clean up `backend/src/index.js` to only handle Express server bootstrap, middleware mounting, and main routing, leaving initialization processes to dedicated helpers.

## Capabilities

### New Capabilities

- `backend-configuration-and-seeding`: Validate environment configuration and seed development databases on startup.

### Modified Capabilities

## Impact

- `backend/src/index.js`: Simplified entry point code.
- `backend/prisma/schema.prisma` or `backend/package.json`: A standard Prisma seed command/script will be introduced.
- Backend initialization flow: Robust start checks and cleaner separation of concerns.
