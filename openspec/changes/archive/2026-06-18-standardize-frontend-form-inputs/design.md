## Context

Multiple modal dialog forms in `frontend/components/` (specifically `AddClientModal.tsx`, `AddServiceModal.tsx`, and `NewAppointmentModal.tsx`) are currently implemented with raw HTML `<input>` elements, repeating duplicated utility classes for padding, focus states, backgrounds, and borders. Standardizing them to utilize Volta UI's custom reusable components will improve code readability, simplify visual maintenance, and align with Volta's typography and spacing guidelines.

## Goals / Non-Goals

**Goals:**

- **Standardize input controls**: Refactor form inputs to use `FloatingInput` from `@/components/ui/volta-ui` across all target modals.
- **Enforce spacing and structural standards**: Replace raw spacing class combinations with Volta's structured layout components (`FieldGroup`, `Field`, `FieldLabel`) and consistent gap definitions.
- **Fix icon alignments**: Centralize leading icon placement within inputs using Volta UI's native `icon` parameter.

**Non-Goals:**

- Creating new state hooks or editing save/submit callback logic in the modal triggers.
- Re-architecting standard select drop-downs and textareas beyond mapping them to standard `Field` structures.
- Altering any CSS file configurations or global design tokens.

## Decisions

### 1. Migrate input elements in modals to `FloatingInput`

Text inputs in `AddClientModal`, `AddServiceModal`, and `NewAppointmentModal` will be replaced with:

```tsx
import { FloatingInput } from "@/components/ui/volta-ui";
// ...
<FloatingInput
  id="name"
  label="Nombre"
  type="text"
  required
  value={formData.name}
  onChange={handleChange}
/>;
```

This handles placeholder, focus-within, leading icon, and floating transition states dynamically.

### 2. Group controls using `FieldGroup` and `Field`

Instead of using raw `div` tags with inconsistent spacing, form layouts will use:

```tsx
<FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Field>
    <FloatingInput ... />
  </Field>
</FieldGroup>
```

## Risks / Trade-offs

- **[Risk]**: Alignment issues with nested icons in `FloatingInput`.
  - _Mitigation_: Leverage the native `icon` property exposed by `FloatingInput` which handles absolute positioning and focus-color changes.
- **[Risk]**: Dropdown selections (`<select>`) not aligning visually with floating-label inputs.
  - _Mitigation_: Place dropdown select elements within standard `<Field>` layout containers with a structured `<FieldLabel>` matching Volta UI tokens.
