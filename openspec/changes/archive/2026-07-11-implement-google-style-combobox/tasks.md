## 1. Core Combobox UI Component

- [x] 1.1 Create the reusable `Combobox` component in `frontend/components/ui/volta-ui.tsx` applying Material Design 3 styles (rounded-xl trigger, rounded-2xl dropdown menu, rounded-xl item pills, hover/active primary-tinted visual cues, and support for leading icons and trailing sublabels).
- [x] 1.2 Implement the React Portal integration inside the component to target `document.body` with safety checks against SSR hydration mismatches.

## 2. Modal Form Migrations

- [x] 2.1 Replace the native select for Services in `NewAppointmentModal.tsx` with the new searchable `Combobox`.
- [x] 2.2 Replace the native select for Frequency in `AddClientModal.tsx` with the new searchable `Combobox`.
- [x] 2.3 Replace the native select for Role in the Worker CRUD modal in `ajustes/page.tsx` with the `Combobox`.

## 3. Table and Header Filters Migrations

- [x] 3.1 Replace the Stylist selector in the Agenda header controls (`agenda/page.tsx`) with the unified `Combobox`.
- [x] 3.2 Replace the Service filter in the Clientes table header (`clientes/page.tsx`) with the unified `Combobox`.

## 4. Build and Styling Verification

- [x] 4.1 Run the Next.js compilation build (`npm run build`) to ensure all TypeScript typings and references compile successfully.
- [x] 4.2 Verify focus, dropdown alignment, and backdrop behaviors across the modified views.
