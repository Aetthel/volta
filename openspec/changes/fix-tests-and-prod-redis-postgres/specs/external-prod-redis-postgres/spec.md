# External Production Redis & Postgres Integration

## ADDED Requirements

### Requirement: Support External Managed Redis Endpoint

The system SHALL connect to an external Redis instance using standard `REDIS_URL` connection strings or individual connection parameters (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USERNAME`, `REDIS_TLS`).

#### Scenario: Connecting via REDIS_URL

- **WHEN** `REDIS_URL` environment variable is defined in production
- **THEN** ioredis client AND BullMQ queue connections MUST parse and use host, port, credentials, and TLS settings from `REDIS_URL` without falling back to local defaults.

#### Scenario: Connecting via Host & Port Parameters

- **WHEN** `REDIS_HOST` and `REDIS_PORT` are defined
- **THEN** ioredis client AND BullMQ queue connections MUST connect using specified host, port, credentials, and optional TLS flags.

### Requirement: Support External Managed PostgreSQL Database

The backend runtime SHALL connect to external PostgreSQL database specified in `DATABASE_URL` during migrations and API execution.

#### Scenario: Executing Prisma Migrations in Production Container

- **WHEN** backend container starts up in production environment
- **THEN** it MUST execute `prisma migrate deploy` against the external PostgreSQL database specified in `DATABASE_URL`.
