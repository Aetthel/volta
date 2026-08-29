## Why

`frontend/components/SubscriptionCheckoutModal.tsx` (695 líneas) y `frontend/components/Sidebar.tsx` (677 líneas) concentran lógica compleja de facturación, pasarela de suscripciones LemonSqueezy, paleta de comandos y navegación multinivel. Modularizar ambos componentes en submódulos especializados optimizará la legibilidad y mantenimiento del frontend.

## What Changes

- **Descomposición de `SubscriptionCheckoutModal.tsx` en `frontend/components/checkout/`**:
  - `PlanSelectionStep.tsx`: Selector de Plan Básico / Pro, calculadora de trabajadores y cupón.
  - `BillingInfoStep.tsx`: Formulario de datos fiscales y facturación (Razón social, NIF/CIF, email).
  - `OrderSummaryStep.tsx`: Desglose de precios, IVA 21% y botón de checkout con LemonSqueezy.
  - `CheckoutSuccessStep.tsx`: Pantalla de confirmación y activación del plan.
- **Descomposición de `Sidebar.tsx` en `frontend/components/sidebar/`**:
  - `WorkspaceSwitcher.tsx`: Selector de negocio, logotipo y plan activo.
  - `SidebarNav.tsx`: Menú multinivel con control de accesos por plan (bloqueos Pro) y atajos de teclado.
  - `SidebarFooter.tsx`: Avatar de usuario y popover de cierre de sesión.
  - `CommandPaletteModal.tsx`: Buscador global y paleta de comandos flotante (`Cmd+K`).

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `reusable-ui-components`: Descomposición modular de la barra lateral de navegación y del flujo modal de contratación.

## Impact

- **Frontend**: `frontend/components/SubscriptionCheckoutModal.tsx`, `frontend/components/Sidebar.tsx`, `frontend/components/checkout/`, `frontend/components/sidebar/`.
- **Mantenibilidad**: Reducción drástica de líneas por archivo y desacoplamiento de submódulos.
