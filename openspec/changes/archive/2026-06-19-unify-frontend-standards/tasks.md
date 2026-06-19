## 1. Environment & Utilities Setup

- [x] 1.1 Install `clsx` and `tailwind-merge` dependencies in `frontend` package
- [x] 1.2 Update `frontend/lib/utils.ts` to implement robust className merging using `twMerge(clsx(...))`

## 2. Refactor Clientes Page

- [x] 2.1 Refactor raw `<button>` elements in `frontend/app/clientes/page.tsx` to use the `<Button>` component
- [x] 2.2 Migrate custom Toast overlay divs (LOPD and message alerts) in `clientes/page.tsx` to `<Alert>` components
- [x] 2.3 Strip explicit sizing classes from Lucide icons and add `data-icon` attributes in `clientes/page.tsx`

## 3. Refactor Sedes Page

- [x] 3.1 Replace raw inputs in the Business Modal (line 472-564) and Worker Modal (line 711-760) with standard form layout components (`FloatingInput`, `Select`, `FieldGroup`, `Field`, `FieldLabel`)
- [x] 3.2 Refactor manual worker error display (line 703) to use the `<Alert variant="error">` component
- [x] 3.3 Strip sizing classes from icons and add `data-icon` attributes in `sedes/page.tsx`

## 4. Refactor Login & Navigation

- [x] 4.1 Replace `div className="relative"` input wrappers in `frontend/app/login/page.tsx` with `<InputGroup>`
- [x] 4.2 Clean up Lucide icon sizing classes inside `Header.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, and `inicio/page.tsx`, ensuring they utilize `data-icon` mapping

## 5. Verification

- [x] 5.1 Run development build (`npm run build` or `npm run dev`) to ensure there are no compilation or styling regressions in the refactored modals and layouts
