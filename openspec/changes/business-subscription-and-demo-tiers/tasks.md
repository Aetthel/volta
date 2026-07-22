## 1. Backend & Data Model

- [ ] Update `prisma/schema.prisma` with `subscriptionStatus` enum ('DEMO_SANDBOX', 'TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED') and timestamps (`trialExpiresAt`, `sandboxExpiresAt`)
- [ ] Run `pnpm prisma:push` to sync PostgreSQL schema
- [ ] Create `checkSubscriptionLimits` middleware helper in `backend/src/middleware/` to enforce feature gates
- [ ] Implement `POST /api/backend/demo/sandbox` endpoint for 20-minute ephemeral sessions

## 2. Frontend & Subscription UI

- [ ] Add Sandbox Demo button & flow on landing page (`/app/page.tsx`) with 20-min countdown timer
- [ ] Add Upgrade to Pro modal component (`UpgradeProModal.tsx`) for feature gates
- [ ] Intercept location creation (`/sedes`) and team invites when Plan Base limits are reached
- [ ] Display expiration banner when Trial expires (14 days) with action to activate Base or Pro plan
