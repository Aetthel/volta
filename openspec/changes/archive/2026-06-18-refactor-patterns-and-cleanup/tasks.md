## 1. Setup Centralized Configuration

- [x] 1.1 Create `backend/src/config.js` to load, validate, and export configuration variables
- [x] 1.2 Update `backend/src/db.js` to use `backend/src/config.js` instead of raw `process.env`
- [x] 1.3 Update `backend/src/whatsapp.js` to use configuration values from `backend/src/config.js`
- [x] 1.4 Update `backend/src/bot.js` to use configuration values from `backend/src/config.js`

## 2. Decouple Database Initialization

- [x] 2.1 Create `backend/src/dbInit.js`
- [x] 2.2 Move `ensureMockBusinessesExist` and client/appointment seeding from `backend/src/index.js` to `backend/src/dbInit.js`
- [x] 2.3 Add error handling to database initialization inside `backend/src/dbInit.js`

## 3. Refactor Server Entrypoint

- [x] 3.1 Remove startup env checks and inline seeding from `backend/src/index.js`
- [x] 3.2 Refactor `backend/src/index.js` to import and call `dbInit.ensureMockBusinessesExist()` and use centralized `config` settings
- [x] 3.3 Verify server starts successfully and database connection, seeding, and routing work correctly
