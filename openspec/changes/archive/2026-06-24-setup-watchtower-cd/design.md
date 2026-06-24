## Context

Currently, deploying updates to the host machine requires manual logging, running `git pull`, and restarting Docker Compose services. This setup adds unnecessary friction to the development flow. Furthermore, the database boot-up script automatically seeds mock appointments and clients when the database is empty, which is undesirable in production environments where a clean database is expected.

## Goals / Non-Goals

**Goals:**
- Automatically pull and restart `volta-frontend` and `volta-backend` when new images are pushed to GitHub Container Registry (GHCR).
- Prevent mock client and appointment seeding when the application starts in production mode (`NODE_ENV=production`).
- Clean up unused old Docker images on the host automatically to avoid running out of disk space.

**Non-Goals:**
- Exposing the host's SSH port to the public internet or managing deployment keys on GitHub Actions.
- Automating database migrations (which will still be manually controlled or handled as a separate workflow).

## Decisions

### 1. Deployment Mechanism: Watchtower
- **Decision**: Integrate `containrrr/watchtower` as a service in `docker-compose.prod.yml` instead of triggering deploys via GitHub Actions SSH scripts.
- **Rationale**:
  - Requires zero inbound ports to be opened on the server's router/firewall (ideal for local/homelab servers).
  - High security: GitHub does not need access to the server's SSH keys or IP address.
  - Simple setup: Only requires mounting `/var/run/docker.sock` and `/config.json` (for GHCR credentials).

### 2. Watchtower Scope and Cleanup
- **Decision**: Restrict Watchtower to monitor only `volta-frontend` and `volta-backend` using `--cleanup --interval 300 volta-frontend volta-backend`.
- **Rationale**:
  - Restricting target containers prevents Watchtower from inadvertently restarting database containers or other stateful services.
  - `--cleanup` deletes old Docker images after a successful pull, preventing host disk saturation.
  - `--interval 300` checks for updates every 5 minutes, balancing fast deployment with registry polling rate limits.

### 3. Conditional Seeding Logic
- **Decision**: Wrap the client and appointment seeding code inside `backend/src/dbInit.js` with an environment check: `if (process.env.NODE_ENV !== 'production')`. Keep the mock base users (`User` and `Business` records) creation logic untouched to allow initial admin login.
- **Rationale**:
  - Allows the system to boot up with an empty client registry in production.
  - Preserves seeding capabilities in local development or test environments.

## Risks / Trade-offs

- **[Risk]**: Watchtower container requires mounting `/var/run/docker.sock`, which grants the container root-like privileges over the host's Docker daemon.
  - **Mitigation**: Use the official, verified `containrrr/watchtower` image and keep the host system secured.
- **[Risk]**: If GHCR rate-limits requests, Watchtower might fail to fetch new images.
  - **Mitigation**: An interval of 300 seconds is well within GitHub's rate limits for authenticated requests.
