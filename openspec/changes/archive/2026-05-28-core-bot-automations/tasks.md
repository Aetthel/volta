## 1. Infrastructure & Setup

- [x] 1.1 Configure `docker-compose.yml` with PostgreSQL and Node.js service
- [x] 1.2 Initialize Node.js project and install core dependencies (`express`, `prisma`, `whatsapp-web.js`, `node-cron`, `dotenv`, `qrcode-terminal`)
- [x] 1.3 Define Prisma schema with `Business` and `Appointment` models
- [x] 1.4 Setup `.env` template with `DATABASE_URL` and `API_KEY`

## 2. Multi-tenant Data Core

- [x] 2.1 Generate Prisma client and run initial database migrations
- [x] 2.2 Create a database utility script to seed/register a test business

## 3. WhatsApp Instance Management

- [x] 3.1 Implement `src/whatsapp.js` to manage multi-instance sessions using `LocalAuth`
- [x] 3.2 Implement QR code output logic for initial terminal-based authentication
- [x] 3.3 Verify session persistence by restarting the service after authentication

## 4. Appointment API

- [x] 4.1 Implement Express server with `API_KEY` middleware protection
- [x] 4.2 Implement `POST /api/appointments` endpoint to create appointments linked to a business
- [x] 4.3 Add validation to ensure appointments are initialized in `PENDING` status

## 5. The Sentinel (Automation Engine)

- [x] 5.1 Implement `src/bot.js` logic to query appointments scheduled for the next day
- [x] 5.2 Implement the messaging loop with random anti-ban delays (30-60 seconds)
- [x] 5.3 Configure `node-cron` to trigger the Sentinel daily at 20:00h

## 6. Testing & Final Validation

- [x] 6.1 Verify API insertion with external tools (Postman/Thunder Client)
- [x] 6.2 Test the full automation cycle by manually triggering a scanning run
- [x] 6.3 Confirm appointment status updates to `SENT` or `ERROR` after dispatch
- [x] 6.4 Validate Docker volume persistence for `wwebjs-auth`
