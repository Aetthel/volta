## 1. Database Schema

- [x] 1.1 Add theme fields (`themeColor`, `fontSizeLevel`, `borderRadiusLevel`) to the `Business` model in [schema.prisma](file:///Users/kore/Documents/Code/Projects/volta/backend/prisma/schema.prisma)
- [x] 1.2 Run database migration and regenerate Prisma Client

## 2. Backend & Authentication

- [x] 2.1 Update validation schema and PUT routes in [business.js](file:///Users/kore/Documents/Code/Projects/volta/backend/src/routes/business.js) to support the new styling properties
- [x] 2.2 Expose business customization fields in the JWT and session callbacks inside [auth.config.js](file:///Users/kore/Documents/Code/Projects/volta/frontend/auth.config.js)

## 3. Global CSS & Theme propagation

- [x] 3.1 Refactor font-size and border-radius declarations in [globals.css](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/globals.css) to scale using multiplier variables
- [x] 3.2 Create client side theme sync component `<ThemeInitializer />` and mount it inside root [layout.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/layout.tsx)

## 4. Personalization UI in Settings

- [x] 4.1 Design and integrate the visual personalization control panel inside the Settings page
- [x] 4.2 Implement form validation, submit to business API, and refresh styling state upon saving settings
