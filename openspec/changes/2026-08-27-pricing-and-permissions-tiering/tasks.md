# Tareas de Implementación: Tarifas de Planes y Matriz de Permisos

## Fase 1: Módulo Central de Permisos y Tipos
- [ ] 1.1 Crear `frontend/lib/permissions.ts` con definiciones de planes (`BASIC` 30€, `PRO` 40€), límites y helpers tipados (`hasFeatureAccess`, `canUserPerform`).
- [ ] 1.2 Actualizar tipos de dominio en `frontend/types/domain.ts` y sincronizar constantes de precios base y add-on de trabajadores (+5€).

## Fase 2: Backend y Middlewares de Control de Límites
- [ ] 2.1 Actualizar `backend/src/middleware/subscriptionMiddleware.js` con las nuevas tarifas y validaciones para 1 vs 2 trabajadores, 1 sede vs multisede, bloqueo de WhatsApp en Básico y cuota de 100 reservas online/mes.
- [ ] 2.2 Actualizar `backend/src/services/subscriptionService.js` con los precios de 30€ y 40€, soporte para add-on de trabajadores y variables de Lemon Squeezy.
- [ ] 2.3 Añadir validación en `backend/src/controllers/userController.js` para respetar el cupo de trabajadores incluidos y slots contratados.
- [ ] 2.4 Proteger endpoints de WhatsApp en `backend/src/controllers/whatsappController.js` para requerir `PRO` o `TRIALING`.

## Fase 3: Frontend y Modales de Suscripción
- [ ] 3.1 Actualizar `frontend/components/SubscriptionCheckoutModal.tsx` con precios de 30€ y 40€, desglose de beneficios y selector dinámico de trabajadores extra (+5€/mes).
- [ ] 3.2 Actualizar `frontend/components/UpgradeProModal.tsx` con el precio de 40€/mes y el listado de funcionalidades Pro exclusivas.
- [ ] 3.3 Actualizar `frontend/components/settings/BillingSection.tsx` con la tabla comparativa oficial de planes y resumen del plan activo.
- [ ] 3.4 Actualizar `frontend/components/TrialBanner.tsx` y textos de precios en el panel.
- [ ] 3.5 Actualizar la sección de precios y tarjetas de la Landing Page (`frontend/app/(landing)/page.tsx`).

## Fase 4: Pruebas y Validación
- [ ] 4.1 Ejecutar suite de pruebas unitarias y de integración (`vitest` / `pnpm test`).
- [ ] 4.2 Verificar compilación limpia de frontend y backend (`pnpm build`).
