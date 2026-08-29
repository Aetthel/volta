## Context

`SubscriptionCheckoutModal.tsx` (695 líneas) y `Sidebar.tsx` (677 líneas) necesitaban separación de responsabilidades y modularidad limpia.

## Goals / Non-Goals

**Goals:**
- Crear submódulos de pasos de checkout en `frontend/components/checkout/`.
- Crear submódulos de sidebar en `frontend/components/sidebar/`.
- Reducir ambos orquestadores a menos de 150 líneas cada uno.

**Non-Goals:**
- No modificar el comportamiento visual ni la integración de LemonSqueezy.

## Decisions

1. **Submódulos de Checkout (`frontend/components/checkout/`)**:
   - `PlanSelectionStep.tsx`
   - `BillingInfoStep.tsx`
   - `OrderSummaryStep.tsx`
   - `CheckoutSuccessStep.tsx`
2. **Submódulos de Sidebar (`frontend/components/sidebar/`)**:
   - `WorkspaceSwitcher.tsx`
   - `SidebarNav.tsx`
   - `SidebarFooter.tsx`
   - `CommandPaletteModal.tsx`

## Risks / Trade-offs

- Ninguno.
