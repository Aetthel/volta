## 1. Navigation Updates

- [x] 1.1 Update `frontend/components/Sidebar.tsx` to include the "Agenda" entry with a Lucide Calendar icon for JEFE and EMPLEADO roles
- [x] 1.2 Update `frontend/components/BottomNav.tsx` to include the "Agenda" entry with a Lucide Calendar icon for JEFE and EMPLEADO roles

## 2. Dedicated Calendar Agenda

- [x] 2.1 Create `frontend/app/agenda/page.tsx` as a copy of the calendar agenda view, including visual weekly/daily grid, ContextMenu triggers, booking guides, and modals
- [x] 2.2 Re-verify that page headers, document titles, and imports are fully configured for the new `/agenda` route

## 3. Redesigned Dashboard

- [x] 3.1 Refactor `frontend/app/inicio/page.tsx` to remove the grid calendar rendering logic and state helpers
- [x] 3.2 Add a clean "Citas de Hoy" timeline widget to list today's scheduled appointments in chronological order with quick-action statuses and delete options
- [x] 3.3 Add business utility widgets to `/inicio`: a service popularity indicator and a WhatsApp gateway connection status check

## 4. Verification

- [x] 4.1 Run build validation (`npm run build`) to ensure no compilation or navigation errors occur
