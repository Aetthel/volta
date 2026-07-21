## 1. Schema & Database

- [x] 1.1 Update Prisma schema `Business` model with `businessType` and `subscriptionPlan` fields
- [x] 1.2 Generate Prisma client and run DB migration

## 2. Backend API & Auth

- [x] 2.1 Create public registration endpoint `/api/auth/register` (creates Business with 10-day trial in Plan Pro 25€ and ADMIN User)
- [x] 2.2 Add input validation and bcrypt password hashing for registration
- [x] 2.3 Integrate automatic trial status evaluation helper

## 3. Frontend Registration & Auth

- [x] 3.1 Create `/register` page with business type selector and clean Volta styling
- [x] 3.2 Update "Get Started", "Empezar Gratis", and pricing CTA buttons in Landing Page (`/app/page.tsx`) and Login (`/app/login/page.tsx`) to link to `/register`
- [x] 3.3 Connect `/register` form to registration API and redirect to login/dashboard upon success

## 4. Trial Banner & Alerts Integration

- [x] 4.1 Create `TrialBanner` component showing remaining trial days, warning states, and CTA button
- [x] 4.2 Integrate `TrialBanner` into main layout above `Header`
- [x] 4.3 Link trial milestone notifications (3 days, 1 day, expired) to the `Alert` system and dropdown
