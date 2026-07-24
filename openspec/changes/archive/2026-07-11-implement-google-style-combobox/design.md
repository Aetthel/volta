## Context

The current frontend implementation of Volta relies on HTML native `<select>` dropdowns wrapped inside the `FloatingSelect` component. These native elements are not styled by our custom theme variables under Safari/Chrome and look basic. Additionally, long lists of options (e.g., service listings or stylist listings) are difficult to navigate without a search filter.

## Goals / Non-Goals

**Goals:**

- Implement a reusable, searchable `Combobox` component in `frontend/components/ui/volta-ui.tsx` styled to replicate Google's Material Design 3 (MD3) Outlined Exposed Dropdown.
- Apply a curvature radius of `12px` (`rounded-xl` / custom CSS) for the Combobox trigger and `16px` (`rounded-2xl`) for the dropdown card menu.
- Ensure the dropdown list options are styled as independent rounded-pill rows with horizontal margins (`mx-2 my-0.5 rounded-xl`), avoiding edge-to-edge square borders.
- Utilize React Portals (`createPortal`) to attach the dropdown menu directly to `document.body`, preventing clipping or backdrop-blur issues on Safari.
- Integrate the new component across all five identified forms.

**Non-Goals:**

- Replacing text inputs (`FloatingInput`) or textareas with this combobox.
- Modifying backend APIs or database schemas.

## Decisions

### Decision 1: Trigger Component Implementation (Button with state vs Input)

- **Choice**: HTML `<button>` element styled to mimic our Outlined floating input wrapper.
- **Rationale**: A button provides native keyboard access, tab-focusing, and supports rich content rendering (e.g., showing a service icon on the left, name in the middle, and price on the right) which is not possible inside a standard HTML `<input readonly>`.
- **Alternative considered**: Using a read-only input. Rejected because styling complex inline elements (like price tags on the right) inside an `<input>` is fragile and lacks flexbox alignment.

### Decision 2: Dropdown Portal Target (`document.body`)

- **Choice**: Direct child of `document.body` via React Portals.
- **Rationale**: Ensures the dropdown menu is never clipped by `overflow-hidden` containers (like the weekly calendar layout or modales) and guarantees the backdrop blur is applied correctly to the full page on Safari.

### Decision 3: Material Design 3 Row Style

- **Choice**: Píldoras rounded options (`mx-2 my-0.5 rounded-xl`).
- **Rationale**: Aligning with the Google Material Design 3 spec creates a modern visual style distinct from standard flat SaaS templates, making Volta feel premium and state of the art.

## Risks / Trade-offs

- **[Risk]** Portals may cause SSR hydration mismatches if executed on the server.
  - **Mitigation**: Introduce a `mounted` state hook so that the portal only attaches after the client-side component mounts.
- **[Risk]** Keyboard navigation accessibility (arrow keys, enter key).
  - **Mitigation**: Implement standard keyboard event listeners (`keydown` for ArrowUp, ArrowDown, and Enter) inside the custom Combobox list.
