# Design: LOPD Consent Audit Trail & Verification Logs

## Database Schema Model (`LopdConsentLog`)

Add `LopdConsentLog` to `backend/prisma/schema.prisma`:

```prisma
model LopdConsentLog {
  id           String   @id @default(uuid())
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  businessId   String
  business     Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  acceptedAt   DateTime @default(now())
  ipAddress    String
  userAgent    String
  policyVersion String   @default("1.0")
  tokenHash    String?

  @@index([clientId])
  @@index([businessId])
}
```

## Controller Flow (`backend/src/controllers/lopdController.js` / `lopdService.js`)

When client accepts consent:

1. Validate HMAC token and expiration.
2. Update `Client.lopdStatus = "Aceptado"`.
3. Create immutable `LopdConsentLog`:
   - `ipAddress`: extracted from `req.ip` or `x-forwarded-for` header.
   - `userAgent`: extracted from `req.headers['user-agent']`.
   - `policyVersion`: "1.0"
   - `acceptedAt`: `new Date()`

## Dashboard Audit UI (`frontend`)

- Provide legal audit view under Client detail modal showing:
  - Consent Status: Aceptado
  - Fecha y Hora de Aceptación
  - Dirección IP
  - Navegador / Dispositivo (User-Agent)
  - Versión de Cláusula Aceptada
