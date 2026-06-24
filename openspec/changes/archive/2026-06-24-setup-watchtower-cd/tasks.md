## 1. Database Seeding Configuration

- [x] 1.1 Add condition in `backend/src/dbInit.js` to check `process.env.NODE_ENV !== 'production'` before inserting mock clients and appointments.
- [x] 1.2 Verify that mock admin, jefe, and employee users are still created/upserted in all environments.
- [x] 1.3 Test locally by setting `NODE_ENV=production` and verifying that the database boots up successfully without seeding client records.

## 2. Watchtower CD Setup

- [x] 2.1 Add the `watchtower` service to `docker-compose.prod.yml` with `/var/run/docker.sock` and `~/.docker/config.json` mounted.
- [x] 2.2 Configure Watchtower options (`--cleanup`, `--interval 300`) and target containers (`volta-frontend`, `volta-backend`).
- [x] 2.3 Add instructions in a deployment README or documentation on how to authenticate the host machine with GHCR (`docker login ghcr.io`).
