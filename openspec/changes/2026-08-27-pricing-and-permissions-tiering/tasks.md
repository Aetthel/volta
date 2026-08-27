# Tareas de Implementación: Tarifas de Planes y Matriz de Permisos

## Fase 1: Módulo Central de Permisos y Tipos
- [x] 1.1 Crear `frontend/lib/permissions.ts` con definiciones de planes (`BASIC` 30€, `PRO` 40€), límites y helpers tipados (`hasFeatureAccess`, `canUserPerform`).
- [x] 1.2 Actualizar tipos de dominio en `frontend/types/domain.ts` y sincronizar constantes de precios base y add-on de trabajadores (+5€).

## Fase 2: Backend y Middlewares de Control de Límites
- [x] 2.1 Actualizar `backend/src/middleware/subscriptionMiddleware.js` con las nuevas tarifas y validaciones para 1 vs 2 trabajadores, 1 sede vs multisede, bloqueo de WhatsApp en Básico y cuota de 100 reservas online/mes.
- [x] 2.2 Actualizar `backend/src/services/subscriptionService.js` con los precios de 30€ y 40€, soporte para add-on de trabajadores y variables de Lemon Squeezy.
- [x] 2.3 Añadir validación en `backend/src/controllers/userController.js` para respetar el cupo de trabajadores incluidos y slots contratados.
- [x] 2.4 Proteger endpoints de WhatsApp en `backend/src/controllers/whatsappController.js` para requerir `PRO` o `TRIALING`.

## Fase 3: Frontend y Modales de Suscripción
- [x] 3.1 Actualizar `frontend/components/SubscriptionCheckoutModal.tsx` con precios de 30€ y 40€, desglose de beneficios y selector dinámico de trabajadores extra (+5€/mes).
- [x] 3.2 Actualizar `frontend/components/UpgradeProModal.tsx` con el precio de 40€/mes y el listado de funcionalidades Pro exclusivas.
- [x] 3.3 Actualizar `frontend/components/settings/BillingSection.tsx` con la tabla comparativa oficial de planes y resumen del plan activo.
- [x] 3.4 Actualizar `frontend/components/TrialBanner.tsx` y textos de precios en el panel.
- [x] 3.5 Actualizar la sección de precios y tarjetas de la Landing Page (`frontend/app/(landing)/page.tsx`).

## Fase 4: Pruebas y Validación
- [x] 4.1 Ejecutar suite de pruebas unitarias y de integración (`vitest` / `pnpm test`).
- [x] 4.2 Verificar compilación limpia de frontend y backend (`pnpm build`).
