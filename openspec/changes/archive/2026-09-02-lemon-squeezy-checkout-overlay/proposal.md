# Proposal: Lemon Squeezy Checkout Overlay Refactor

## Why

El flujo actual de suscripción utiliza una ventana modal personalizada de 4 pasos (`SubscriptionCheckoutModal` y subcomponentes en `components/checkout/`) que añade complejidad innecesaria, mantenimiento adicional de estado de facturación/cupones en frontend y no aprovecha la experiencia nativa de Checkout Overlay alojada y mantenida por Lemon Squeezy.
Migrar al Checkout Overlay oficial de Lemon Squeezy simplifica drásticamente el código frontend, garantiza el cumplimiento normativo y de conversión optimizado por Lemon Squeezy, y asocia directamente las sesiones de pago a los usuarios autenticados mediante query parameters dinámicos (`checkout[custom][user_id]` y `checkout[email]`).

## What Changes

- **REMOVAL**: Eliminación de `frontend/components/SubscriptionCheckoutModal.tsx`, `frontend/components/SubscriptionCheckoutModal.test.tsx` y todo el directorio `frontend/components/checkout/` (`BillingInfoStep.tsx`, `OrderSummaryStep.tsx`, `PlanSelectionStep.tsx`, `CheckoutSuccessStep.tsx`).
- **CLEANUP**: Limpieza de estados y referencias obsoletas de apertura/cierre de modal (`isCheckoutOpen`, `checkoutPlan`, etc.) en `BillingSection.tsx`, `TrialBanner.tsx`, `UpgradeProModal.tsx` y `app/(landing)/page.tsx`.
- **DEPENDENCY**: Instalación del paquete oficial `@lemonsqueezy/lemonsqueezy.js`.
- **GLOBAL INITIALIZATION**: Inicialización de `window.createLemonSqueezy()` en el ciclo de vida del cliente (`useEffect` en `Providers.tsx` o wrapper global) asegurando la detección y binding de enlaces con la clase `lemonsqueezy-button`.
- **BUTTON & LINK REFACTOR**: Sustitución de los botones de apertura de modal por elementos `<a>` con la clase CSS `lemonsqueezy-button` y soporte de diseño Volta UI.
- **DYNAMIC QUERY INJECTION**: Construcción dinámica de los enlaces de checkout inyectando el `user.id` (`checkout[custom][user_id]`) y `user.email` (`checkout[email]`) desde la sesión de NextAuth (`useSession`), con placeholders claros `// TODO: Insertar URL del producto de Lemon Squeezy aquí`.

## Capabilities

### Modified Capabilities
- `subscription-billing-checkout`: Actualización de los requisitos del checkout en frontend para eliminar la modal multi-paso custom y requerir la integración directa del Checkout Overlay nativo mediante enlaces `lemonsqueezy-button` con parámetros de usuario pre-poblados.

## Impact

- **Frontend Components**:
  - `frontend/components/SubscriptionCheckoutModal.tsx` (eliminado)
  - `frontend/components/SubscriptionCheckoutModal.test.tsx` (eliminado / actualizado)
  - `frontend/components/checkout/*` (eliminados)
  - `frontend/components/settings/BillingSection.tsx` (refactorizado)
  - `frontend/components/TrialBanner.tsx` (refactorizado)
  - `frontend/components/UpgradeProModal.tsx` (refactorizado)
  - `frontend/app/(landing)/page.tsx` (refactorizado)
  - `frontend/components/Providers.tsx` / `ClientProvidersWrapper.tsx` (inicialización de Lemon Squeezy)
- **Dependencies**: `@lemonsqueezy/lemonsqueezy.js` añadido a `package.json`.
- **APIs / External**: Lemon Squeezy Checkout Overlay (`lemon.js`).
