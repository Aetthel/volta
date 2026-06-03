## 1. Database & Schema Updates

- [x] 1.1 Update `prisma/schema.prisma` with `BusinessRole` enum and new fields (email, password, role, welcomeMessage, reminderMessage)
- [x] 1.2 Create and run a Prisma migration to apply changes to the database
- [x] 1.3 Create a seed script to create the initial `ADMIN` user account

## 2. Next.js Project Initialization

- [x] 2.1 Setup Next.js in the project root with App Router, Tailwind CSS, and TypeScript/JavaScript
- [x] 2.2 Install core dependencies: `next-auth`, `bcryptjs`, `lucide-react`, `shadcn/ui`
- [x] 2.3 Configure `Auth.js` (NextAuth) with Prisma adapter and JWT strategy

## 3. Authentication & Authorization

- [x] 3.1 Implement the Login page UI using shadcn/ui
- [x] 3.2 Configure Auth.js callbacks to include `role` and `businessId` in the session/JWT
- [x] 3.3 Implement middleware to protect `/admin` (Admin only) and `/dashboard` (Business only) routes

## 4. Admin Dashboard (Super-Admin)

- [x] 4.1 Create Admin layout with sidebar navigation
- [x] 4.2 Build Business List page showing all registered businesses and their status
- [x] 4.3 Implement "Create Business" form with password hashing

## 5. Business Dashboard

- [x] 5.1 Create Business layout and welcome page
- [x] 5.2 Build Settings page for editing custom message templates (Welcome/Reminder)
- [x] 5.3 Implement WhatsApp connection status view and QR code display

## 6. Appointment Management (Agenda)

- [x] 6.1 Create the Agenda view (Timeline/List) for the business dashboard
- [x] 6.2 Implement the "Quick Add Appointment" form using shadcn/ui and react-hook-form
- [x] 6.3 Connect the form to the backend API to save appointments in Prisma
- [x] 6.4 Implement appointment cancellation/deletion logic from the UI

## 7. Bot Logic Integration

- [x] 7.1 Refactor `WhatsAppManager` to work as a global singleton within Next.js
- [x] 7.2 Update message sending logic to use custom templates and variables ({{clientName}}, etc.)
- [x] 7.3 Update API endpoints to trigger instant welcome messages upon appointment creation
