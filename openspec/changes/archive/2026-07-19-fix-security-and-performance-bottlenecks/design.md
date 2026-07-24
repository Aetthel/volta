## Context

Volta contains several security, memory, and database performance vulnerabilities:

- The login rate limiter resets on credential check redirects or error payloads.
- Persistent WhatsApp clients leak event listeners on reconnect wait loops.
- Daily cron jobs block sequentially for 45s on each disconnected business.
- In-memory database scans are used to match names/phones when creating appointments.
- Frontend JWT parsing crashes on invalid signatures due to a missing buffer size match.

## Goals / Non-Goals

**Goals:**

- Fix the login rate limit bypass to enforce password bruteforcing lockouts.
- Remove all WhatsApp EventEmitter memory leaks.
- Ensure the Sentinel cron process handles disconnected WhatsApp sessions in < 1s instead of 45s.
- Move client existence checks from in-memory JavaScript scanning to database-level querying.
- Standardize frontend JWT decoding to safely catch size differences before signature validation.

**Non-Goals:**

- We are not changing the authentication engine (NextAuth.js v5 remains).
- We are not changing the WhatsApp integration package (`whatsapp-web.js` remains).
- We are not redesigning the database schema (no new tables).

## Decisions

### Decision 1: Rate Limiter Reset Flow Control

- **Choice**: Clone and inspect the NextAuth response structure in the route handler.
- **Why**: Inspecting the redirect `Location` header or the parsed JSON body of 200 OK errors is the only way to accurately distinguish a successful login from a failed login attempt when using NextAuth's built-in Credentials provider.
- **Alternative considered**: Implementing a separate custom API key or custom login endpoint. Rejected because keeping Auth.js v5 standard endpoints is better for long-term maintenance.

### Decision 2: Proper Listener Dereferencing in `waitForReady`

- **Choice**: Convert the event callbacks to named handler functions and use `client.off(...)` to unregister all listeners once any single event completes.
- **Why**: `client.once()` only unregisters the single event that fires. The other three remain attached indefinitely. Explicitly clearing all listeners prevents memory leaks.
- **Alternative considered**: Setting a very short timeout. Rejected because it does not solve the listener leakage for successful reconnections.

### Decision 3: Sentinel Fail-Fast & Grouping

- **Choice**: Query the business's current WhatsApp status from the database prior to attempting a connect. Skip processing if state is `WAITING_QR` or `DISCONNECTED`.
- **Why**: Prevents Puppeteer from timing out (45s) sequentially for every single appointment in disconnected businesses.
- **Alternative considered**: Running all sentinel jobs in parallel. Rejected because WhatsApp rate-limiting is strict and concurrency per session must still be throttled to prevent spam flags.

### Decision 4: DB-Level Client Filtering

- **Choice**: Search by normalized phone number, and fallback to case-insensitive name matching at the PostgreSQL database level using Prisma.
- **Why**: Avoids loading the entire `Client` table of a business in memory for every appointment created.
- **Alternative considered**: Adding a unique database key. Rejected because a business might have duplicate names, but phone lookups should query database indexes.

## Risks / Trade-offs

- **[Risk]**: Checking JSON bodies on NextAuth 200 responses requires cloning the response stream.
  - _Mitigation_: Use `response.clone().json()` to read the body without consuming the main response stream.
- **[Risk]**: Database query matching for name/phone might fail to match minor spacing discrepancies that `normalizeString` handles.
  - _Mitigation_: Ensure incoming phone numbers are normalized prior to database lookup, and search using insensitive equals filters.
