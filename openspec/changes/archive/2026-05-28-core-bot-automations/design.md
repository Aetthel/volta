## Context

Volta is designed as a multi-tenant SaaS for automated business notifications. Phase 1 focuses on the "Core Bot & Automations," which is the engine that drives the entire system. The system will be deployed on a local Proxmox server using Docker Compose, requiring a robust but lightweight architecture.

## Goals / Non-Goals

**Goals:**

- Implement a multi-tenant data model using Prisma and PostgreSQL.
- Support multiple concurrent WhatsApp sessions using `whatsapp-web.js`.
- Automate appointment reminders with human-like pacing (anti-ban).
- Provide a secure API endpoint for external appointment insertion.
- Ensure session persistence across container restarts.

**Non-Goals:**

- Development of a web-based dashboard or customer portal.
- Implementation of complex OAuth or multi-role user management.
- Real-time two-way chat functionality (focus is on outbound notifications).

## Decisions

### 1. Database & ORM: PostgreSQL + Prisma

- **Decision**: Use PostgreSQL for data storage and Prisma for ORM.
- **Rationale**: PostgreSQL offers the reliability needed for appointment scheduling. Prisma provides a type-safe API and easy schema migrations.
- **Alternative**: SQLite (Easier setup but lacks the multi-tenant scalability and robustness of Postgres).

### 2. WhatsApp Library: whatsapp-web.js with LocalAuth

- **Decision**: Use `whatsapp-web.js` with `LocalAuth` and session folders indexed by `businessId`.
- **Rationale**: It allows for multiple instances without the costs of the official WhatsApp Business API. `LocalAuth` simplifies session management by storing credentials in the filesystem.

### 3. Automation Engine: node-cron + Safety Queue

- **Decision**: Use `node-cron` to trigger a scanning job at 20:00h daily.
- **Rationale**: Simple, reliable, and runs within the same Node.js process. The job will use an async loop with random delays (30-60s) to process the queue.

### 4. API Security: Static API Key

- **Decision**: Secure the `/api/appointments` endpoint using a single `API_KEY` defined in the `.env` file.
- **Rationale**: Provides immediate security for MVP testing without the overhead of JWT or session-based auth.

## Risks / Trade-offs

- **[Risk] WhatsApp Account Suspension** → **Mitigation**: Implement random message delays (30-60s) and rotate message templates if necessary.
- **[Risk] Docker Volume Permissions** → **Mitigation**: Ensure the `wwebjs-auth` volume has proper write permissions for the Node.js user.
- **[Risk] Concurrent Session Resource Usage** → **Mitigation**: Monitor memory usage of Chromium instances; consider headless mode and resource-limiting in Docker.
