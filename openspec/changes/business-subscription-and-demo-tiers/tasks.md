## 1. Backend & Data Model

- [x] Update `prisma/schema.prisma` with `subscriptionStatus` enum ('DEMO_SANDBOX', 'TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELLED') and timestamps (`trialExpiresAt`, `sandboxExpiresAt`)
- [x] Run `pnpm prisma:push` to sync PostgreSQL schema
- [x] Create `checkSubscriptionLimits` middleware helper in `backend/src/middleware/` to enforce feature gates
- [x] Implement `POST /api/backend/demo/sandbox` endpoint for 20-minute ephemeral sessions

## 2. Frontend & Subscription UI

- [x] Add Sandbox Demo button & flow on landing page (`/app/page.tsx`) with 20-min countdown timer
- [x] Add Upgrade to Pro modal component (`UpgradeProModal.tsx`) for feature gates
- [x] Intercept location creation (`/sedes`) and team invites when Plan Base limits are reached
- [x] Display expiration banner when Trial expires (14 days) with action to activate Base or Pro plan
