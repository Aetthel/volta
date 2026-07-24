## Context

The Volta project follows a strict UI standard called "Volta UI" (documented in [GEMINI.md](file:///Users/kore/Documents/Code/Projects/volta/GEMINI.md)). Currently, several pages and components bypass the standard atomic elements in `volta-ui.tsx` in favor of raw HTML elements decorated with utility classes, which leads to layout drift and visual inconsistencies. Additionally, the styling helper `cn` does not properly merge overriding classes, preventing reliable custom styling configurations.

## Goals / Non-Goals

**Goals:**

- **Robust Class Overrides**: Support merging Tailwind class inputs dynamically by implementing `tailwind-merge` in the `cn` utility.
- **Component Consistency**: Eliminate raw `<button>`, `<input>`, and custom alert divs, shifting them to standard `Button`, `FloatingInput`, and `Alert` components.
- **Shorthand Icon Sizing**: Align Lucide icon declarations with the global `globals.css` icon attribute pattern (`[data-icon]`), removing manual height/width utility classes.

**Non-Goals:**

- Altering the functional event handlers or business/state logic of the page components.
- Adjusting global color tokens or theme definitions.
- Refactoring backend endpoints or routing schemas in this change.

## Decisions

### 1. Integrate `clsx` and `tailwind-merge` in `cn`

We will replace the basic join in `frontend/lib/utils.ts` to prevent style class conflicts:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. Standardize Icon Attributes

Lucide icons inside buttons or headers will be declared without sizing utility classes (`w-*`, `h-*`). Instead, they will use `data-icon`:

```tsx
// Before: <Plus className="w-4 h-4" />
// After:  <Plus data-icon="plus" />
```

### 3. Replace Raw UI Elements

- In `clientes/page.tsx`, we will replace custom button styles with `<Button>` instances (e.g. `variant="primary"`, `variant="outline"`).
- In `sedes/page.tsx`, raw input fields for "Nombre Comercial", "Email", etc., will be migrated to `<FloatingInput>` or `<Select>` where applicable.
- Manual error boxes and toast overlays will be migrated to the unified `<Alert>` component.

## Risks / Trade-offs

- **[Risk]**: `tailwind-merge` might alter the visual sizing of certain elements if they depend on redundant classes resolving in a specific browser-defined declaration order.
  - _Mitigation_: Perform a thorough visual validation of the layout changes after updating the utility.
- **[Risk]**: Input components might have sizing issues in grid containers.
  - _Mitigation_: Wrap them in standard `<Field>` and `<FieldGroup>` elements, which enforce `gap-4` and column layout standards automatically.
