## 1. Backend Tenant Isolation

- [x] 1.1 Add tenant validation to GET and POST routes in appointments.js
  - **File**: `backend/src/routes/appointments.js`
  - **Description**: In both handlers, verify that `req.user.role === 'ADMIN'` or the requested `businessId` matches `req.user.businessId`.
- [x] 1.2 Add tenant validation to GET, POST, PUT, and DELETE routes in services.js
  - **File**: `backend/src/routes/services.js`
  - **Description**: Add checks to ensure that the logged-in user can only query, create, update, or soft-delete services belonging to their business.
- [x] 1.3 Add tenant validation to all whatsapp.js router handlers
  - **File**: `backend/src/routes/whatsapp.js`
  - **Description**: Add `businessId` ownership validation checks in all active route handlers.

## 2. Frontend Layout & Visual Fixes

- [x] 2.1 Fix monthNames array in agenda page.tsx
  - **File**: `frontend/app/agenda/page.tsx`
  - **Description**: Complete the `monthNames` array declarations to cover all 12 calendar months (Julio, Agosto, Septiembre, Octubre, Noviembre).
- [x] 2.2 Correct outdated database-storage comments in NewAppointmentModal
  - **File**: `frontend/components/NewAppointmentModal.tsx`
  - **Description**: Clean up the comment on line 206 referencing service details storage.

## 3. UI Route Protection

- [x] 3.1 Restrict client-side navigation on admin page.tsx
  - **File**: `frontend/app/admin/page.tsx`
  - **Description**: Fetch session context and show a clear Access Denied component/Alert if user is not `ADMIN`.
- [x] 3.2 Restrict client-side navigation on sedes page.tsx
  - **File**: `frontend/app/sedes/page.tsx`
  - **Description**: Validate session role and show a clear Access Denied component/Alert if user is not `ADMIN`.

## 4. WhatsApp Bot Initialization Fixes

- [x] 4.1 Wait for WhatsApp client readiness in sendWelcomeMessage
  - **File**: `backend/src/bot.js`
  - **Description**: Await `whatsappManager.waitForReady()` right after calling `initClient()`.
- [x] 4.2 Wait for WhatsApp client readiness in runSentinel
  - **File**: `backend/src/bot.js`
  - **Description**: Await `whatsappManager.waitForReady()` right after calling `initClient()`.
