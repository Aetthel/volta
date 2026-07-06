## 1. Inicio Page Color Standardization

- [x] 1.1 Remove raw hex colors `#005d63` and `#b2f1e8` from KPI Metrics in `app/inicio/page.tsx`
- [x] 1.2 Remove raw hex colors `#005d63` and `#00474b` from dashboard link actions and floating mobile FAB in `app/inicio/page.tsx`
- [x] 1.3 Replace hardcoded slate colors (`slate-800`, `slate-500`, `slate-400`, `slate-100`, `slate-50`) with standard layout tokens (`on-surface`, `on-surface-variant`, `outline-variant`, `surface-container-low`)

## 2. Agenda Page Color Standardization

- [x] 2.1 Replace status colors in agenda items (unconfirmed clock to `text-error`, confirmed check to `text-primary`) in `app/agenda/page.tsx`

## 3. Ajustes Page Color Standardization

- [x] 3.1 Replace hardcoded steel blue `#b0c4de` and slate overrides with standard theme containers in `app/ajustes/page.tsx`
- [x] 3.2 Update status indicators (online to `text-primary` / `bg-primary`, idle/offline to `text-error` / `bg-error`) in `app/ajustes/page.tsx`

## 4. UI Primitives Alert Standardization

- [x] 4.1 Update Alert component variant styles (`success`, `warning`) to use system colors in `components/ui/volta-ui.tsx`
