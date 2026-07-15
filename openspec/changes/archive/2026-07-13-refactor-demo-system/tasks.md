## 1. Database Initialization Cleanup

- [x] 1.1 Remove mock users and mock business seeding from `backend/src/config/dbInit.js`
- [x] 1.2 Remove mock clients and appointments seeding from `backend/src/config/dbInit.js`
- [x] 1.3 Verify database initializes without seeding any development records when running in development mode

## 2. Authentication Middleware Fixes

- [x] 2.1 Update role lookup in `frontend/proxy.js` to fallback to `req.auth?.role`
- [x] 2.2 Validate successful login and redirection behavior to `/inicio` when using the "Crear Demo" flow
