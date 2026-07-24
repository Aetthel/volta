## Context

The application uses modal forms for core creation actions. Currently, these modals use outlined box container inputs and dark blurry backdrops. The user wishes to transition to a lightweight, row-based layout (inspired by Google Calendar) where inputs are borderless, aligned inline with leading icons, and respect the user's Settings-controlled border radius (roundness) scale.

## Goals / Non-Goals

**Goals:**

- Add a borderless `variant="minimal"` to core components (`FloatingInput`, `Combobox`, `FloatingTextarea`) in [volta-ui.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/ui/volta-ui.tsx).
- Redesign `NewAppointmentModal.tsx` and `AddClientModal.tsx` to arrange inputs as minimal rows aligned with leading Lucide icons.
- Ensure all modal corners, buttons, and input boundaries respect the `--radius-scale` settings property.
- Support `searchable={false}` in `Combobox` to hide the search header for simple selections like hours and minutes.
- Remove dark backdrop blurs, replacing them with light, translucent overlays that don't darken or blur the screen.

**Non-Goals:**

- Creating entirely new input files (we must extend `volta-ui.tsx`).
- Modifying other complex pages like `agenda` or `clientes` settings beyond their portal backdrop overlays.

## Decisions

### 1. Reusing Core UI Components with a `variant` Prop

- **Decision**: Introduce a `variant?: "outlined" | "minimal"` prop to `FloatingInput`, `Combobox`, and `FloatingTextarea` in `volta-ui.tsx`.
- **Rationale**: Keeps the codebase DRY (Don't Repeat Yourself). All focus states, portal overlays, and value changes remain handled by unified components.
- **Alternatives Considered**: Creating new components (e.g., `MinimalInput`). Discarded due to code duplication and maintenance overhead.

### 2. Setting-Driven Scalable Border Radius

- **Decision**: Avoid static CSS classes like `rounded-full` (pills) or `rounded-2xl` on the redesigned components. Instead, use standard Tailwind scale-aware classes (`rounded-sm`, `rounded-default`, `rounded-lg`, `rounded-xl`) which evaluate to CSS variables scaled by `--radius-scale`.
- **Rationale**: Allows the roundness of the entire form (modals, buttons, dropdown triggers) to scale dynamically with the user's setting in Settings. If scale is set to `0`, corners become square; if scaled up, they become fully rounded.
- **Alternatives Considered**: Hardcoding pixel-based corners. Rejected because it would violate user preferences.

### 3. Light Backdrop Overlays

- **Decision**: Replace `bg-inverse-surface/40 backdrop-blur-sm` in overlays with a light translucent mask like `bg-black/5` or `bg-transparent`.
- **Rationale**: Removes dark overlay visual weight and eliminates Safari backdrop-blur stacking context bugs.
- **Alternatives Considered**: Retaining blur filters. Rejected to match the clean light look and guarantee compositing performance.

### 4. Non-Searchable Toggle for Combobox

- **Decision**: Add a `searchable?: boolean` prop (defaulting to `true`) to `Combobox`. When `false`, hide the search input box inside the portal menu overlay.
- **Rationale**: Allows the `Combobox` to behave as a clean dropdown for simple selections (like choosing hours or minutes) while sharing the same rounded menu container and hover pill highlights.

## Risks / Trade-offs

- **[Risk]** Text inputs without border outlines might have low click affordance.
  - _Mitigation_: We place high-contrast Lucide icons to the left, use placeholders, and add visual hover/focus bottom border transitions to clearly indicate clickability.
- **[Risk]** Changing core components in `volta-ui.tsx` might break existing forms.
  - _Mitigation_: The `variant` prop defaults to `"outlined"`, preserving current styling for all other views in the application.
