## 1. Schema & Database Updates

- [x] 1.1 Update `schema.prisma` with `enablePublicBooking` in `Business` and `capacity` in `Service`
- [x] 1.2 Run `pnpm prisma:push` and `pnpm prisma:generate` to update PostgreSQL and client bindings

## 2. Backend Services & Controllers

- [x] 2.1 Update `servicesController.js` and `serviceService.js` to manage service capacity
- [x] 2.2 Create `publicBookingController.js` and public routes `/api/public/booking/:businessId`
- [x] 2.3 Add client recognition helper by phone/email to avoid duplication upon public booking

## 3. Frontend Booking Portal & Settings UI

- [x] 3.1 Add Public Booking Toggle in Business Settings (`ajustes/page.tsx` & `BusinessSection.tsx`)
- [x] 3.2 Add Service Capacity selector input in Service modal
- [x] 3.3 Create public booking page at `frontend/app/booking/[businessId]/page.tsx` for unauthenticated client booking
