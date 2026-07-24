## Why

Currently, deployments on the server require manual intervention (pulling code and restarting containers), which is slow and error-prone. Additionally, the database startup routine automatically seeds mock demonstration data if the database is empty, which can contaminate the production database upon its first deployment or database resets.

## What Changes

- Add Watchtower service to the production Docker Compose setup to monitor the GitHub Container Registry and automatically pull and restart containers on image updates.
- Modify the database initialization logic to prevent mock/seeding data from being created if `NODE_ENV === 'production'`.
- Clean up unused images on the host server automatically via Watchtower parameters.

## Capabilities

### New Capabilities

- `deployment-automation`: Containers automatically pull new built images from GHCR and restart gracefully without manual commands.
- `production-safe-seeding`: Seeding of mock clients and appointments is skipped when running in production (`NODE_ENV === 'production'`).

### Modified Capabilities

None.

## Impact

- **Production Docker Compose**: Modifies `docker-compose.prod.yml` to include the Watchtower service.
- **Database Initialization**: Modifies `backend/src/dbInit.js` to conditionalize mock data seeding.
