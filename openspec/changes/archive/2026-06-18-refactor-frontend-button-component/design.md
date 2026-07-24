## Context

Raw HTML `<button>` tags with duplicate Tailwind layout, color, and focus utility classes are spread throughout the modals and pages in `frontend/components/` and `frontend/app/`. This lack of componentization results in styling inconsistencies (different paddings, mismatched cancel text colors, and conflicting font weights) and degrades maintainability.

## Goals / Non-Goals

**Goals:**

- **Centralize button styles**: Create a reusable `<Button />` component in `frontend/components/ui/volta-ui.tsx` to handle standard sizes and variants.
- **Enforce visual standards**: Standardize on `font-medium` weight and prevent the use of bold text (`font-bold` or `font-semibold`) on buttons, matching user preferences.
- **Standardize cancellation colors**: Standardize outline cancel buttons to use consistent border configurations and text alignment across all creation forms.

**Non-Goals:**

- Creating custom form handling or submitting logic.
- Standardizing icon sizes inside buttons within this change (icons will continue using their respective default/explicit sizing, but buttons will flex-align them).

## Decisions

### 1. Introduce `<Button />` Component in `volta-ui.tsx`

We will add a new component that exports standard variants and sizes:

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}
```

Standard style specifications:

- **Font Weight**: Clean `font-medium` weight (strictly avoiding `font-semibold` and `font-bold`).
- **Transition**: `active:scale-[0.98] transition-all duration-200 cursor-pointer`.
- **Variants**:
  - `primary`: `bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container`
  - `secondary`: `bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80`
  - `outline`: `border border-outline text-primary hover:bg-surface-container`
  - `ghost`: `text-on-surface-variant hover:bg-surface-variant hover:text-on-surface`
- **Sizes**:
  - `sm`: `px-3 py-1.5 text-label-sm rounded-md`
  - `md`: `px-5 py-2 text-label-md rounded-lg`
  - `lg`: `px-6 py-2.5 text-label-lg rounded-lg`

### 2. Refactor Modals and Views to use `<Button />`

All creation forms (`AddClientModal`, `AddServiceModal`, `NewAppointmentModal`) including their close buttons, layout headers, navigation elements, utility buttons, switches, and other page views (`ajustes/page.tsx`, `sedes/page.tsx`, `login/page.tsx`, `lopd/[id]/page.tsx`, `error.tsx`, `not-found.tsx`, `admin/page.tsx`, and `Header.tsx`) will be refactored to use the new `<Button />` component, ensuring uniform style variants and medium typography.

## Risks / Trade-offs

- **[Risk]**: Buttons inside desktop-specific components (like Sidebar) require full-width styles.
  - _Mitigation_: Ensure the `<Button />` component propagates the standard Tailwind `w-full` utility class correctly via class name merging (`cn()`).
- **[Risk]**: Inline buttons with highly custom colors (like red delete buttons or green send buttons) might not fit the three basic variants.
  - _Mitigation_: Fall back to custom className parameters on `<Button />` or standard styling override.
