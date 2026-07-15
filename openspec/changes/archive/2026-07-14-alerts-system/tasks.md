## 1. Database and Backend Implementation

- [x] 1.1 Add `Alert` model and `AlertType` enum to `backend/prisma/schema.prisma` and run Prisma migrations
- [x] 1.2 Create alerts routing file at `backend/src/routes/alerts.js` with GET, PUT, and POST endpoints
- [x] 1.3 Register alerts routing inside the backend Express application
- [x] 1.4 Update demo initialization and db seeding to generate sample alerts (emergente, aviso, notificacion)

## 2. Frontend Layout and Global State

- [x] 2.1 Set up frontend React hook/context for alerts polling and global state
- [x] 2.2 Re-implement the notification bell icon in `frontend/components/Header.tsx` to display the status badge

## 3. Notification Dropdown popover

- [x] 3.1 Create a custom floating popover menu next to the bell button inside `frontend/components/Header.tsx`
- [x] 3.2 Implement a scrollable container inside the popover displaying Warnings (Avisos) and standard Notifications, rendering read alerts as dimmed
- [x] 3.3 Add the anchored, paginated `EMERGENTE` carousel card at the top of the dropdown menu

## 4. Dashboard Welcome Modals and Admin broadcasting

- [x] 4.1 Implement a paginated modal overlay at `/inicio` displaying unread `EMERGENTE` alerts with carousel dot navigation
- [x] 4.2 Build a broadcast interface in `/admin` to compose and post manual alerts to targeted users
