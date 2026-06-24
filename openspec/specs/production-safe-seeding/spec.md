# Capability: Production Safe Seeding

## Purpose
Prevent mock/demonstration database records from contaminating production database environments.

## Requirements

### Requirement: Skip mock seeding in production
The database initialization routine SHALL skip seeding mock/demonstration clients and appointments when running in a production environment.

#### Scenario: Running in production environment
- **WHEN** the backend application starts and `NODE_ENV` is set to `production`
- **THEN** mock data seeding is not executed, even if the database is empty

#### Scenario: Running in non-production environment
- **WHEN** the backend application starts, `NODE_ENV` is not `production`, and the database is empty
- **THEN** mock data seeding is executed to populate demonstration records
