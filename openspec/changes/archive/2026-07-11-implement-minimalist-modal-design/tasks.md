## 1. Core UI Components Refactoring (volta-ui.tsx)

- [x] 1.1 Add `variant?: "outlined" | "minimal"` prop to `FloatingInput` and adjust styles to support borderless styling and focus underlines.
- [x] 1.2 Add `variant?: "outlined" | "minimal"` and `searchable?: boolean` props to `Combobox`, styling the trigger as inline-borderless and supporting hiding the search bar inside the portal menu overlay.
- [x] 1.3 Add `variant?: "outlined" | "minimal"` prop to `FloatingTextarea` to support borderless row integration.

## 2. Appointment Modal Redesign (NewAppointmentModal.tsx)

- [x] 2.1 Replace the backdrop overlay classes to remove blur and utilize a light translucent backdrop (`bg-black/5` or `bg-transparent`).
- [x] 2.2 Re-arrange header layout, adding the aesthetic drag handle icon (`=`) on the top-left and the close button (`X`) on the top-right.
- [x] 2.3 Refactor form fields into an icon-driven layout (Client Name, Phone, Service, Date/Time, Notes) using the `minimal` variant.
- [x] 2.4 Convert Hora and Minuto select fields to use non-searchable `Combobox` elements.
- [x] 2.5 Style footer buttons to use setting-scaled rounded classes (e.g. `rounded-xl` or `rounded-lg`).

## 3. Client Modal Redesign (AddClientModal.tsx)

- [x] 3.1 Replace backdrop overlay classes to remove blur and use a light translucent backdrop.
- [x] 3.2 Restructure the header layout with drag handle icon and close button.
- [x] 3.3 Refactor fields (Name, Phone, Email, Frequency, Notes) into clean icon-driven minimal rows.
- [x] 3.4 Style footer buttons using setting-scaled rounded classes.

## 4. Verification and Quality Assurance

- [x] 4.1 Run the Next.js compilation build (`npm run build`) to ensure all TypeScript typings and references compile successfully.
- [x] 4.2 Verify focus states, dropdown positioning, and backdrop overlay behavior under different scale options in Settings.
