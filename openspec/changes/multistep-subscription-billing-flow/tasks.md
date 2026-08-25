## 1. Modelo de Datos y Backend de Lemon Squeezy

- [x] 1.1 Extender `schema.prisma` con el modelo `Invoice` (con `lemonSqueezyId`, `invoiceUrl`, `amount`, `status`, `createdAt`) y añadir campos `lemonSqueezyCustomerId`, `lemonSqueezySubscriptionId`, `gracePeriodExpiresAt` y `cancelAtPeriodEnd` en `Business`, ejecutando `pnpm --filter backend prisma:push`.
- [x] 1.2 Implementar el servicio de integración con Lemon Squeezy en backend (`POST /api/backend/subscription/checkout-url`, `POST /api/backend/subscription/cancel`, `GET /api/backend/subscription/current`) con soporte de trial, planes Básico/Pro y modo mock local sin claves.
- [x] 1.3 Implementar el manejador de webhooks seguro en backend (`POST /api/backend/webhooks/lemonsqueezy`) con validación criptográfica HMAC SHA-256 para eventos de creación, cobro exitoso, fallo de pago (gracia 3 días) y cancelación.
- [x] 1.4 Implementar endpoint de listado de facturas (`GET /api/backend/subscription/invoices`) con URLs de descarga al PDF oficial de Lemon Squeezy.
- [x] 1.5 Añadir pruebas unitarias y de integración para la creación de sesiones de checkout, validación de webhooks y sincronización del estado de suscripción.

## 2. Componente de Checkout en Frontend (Lemon.js Overlay)

- [x] 2.1 Crear el componente `SubscriptionCheckoutModal.tsx` con selector de plan mensual (Básico 18€/mes vs Pro 25€/mes), soporte de cupones promocionales y botón de lanzamiento del overlay seguro.
- [x] 2.2 Integrar el script de `Lemon.js` en el layout para habilitar el checkout overlay embebido en la aplicación y capturar el evento `CheckoutSuccess`.
- [x] 2.3 Implementar el refresco reactivo de la sesión en NextAuth vía `update()` y pantalla de confirmación tras el pago exitoso.

## 3. Integración en Ajustes, Avisos y Bloqueos

- [ ] 3.1 Añadir la pestaña "Facturación y Suscripción" en la página de Ajustes (`/ajustes`) para roles `JEFE` y `ADMIN`, con visualización del plan activo, botón de cambio de plan, botón de cancelación y tabla de facturas con enlace de descarga al PDF oficial del MoR.
- [ ] 3.2 Actualizar `TrialBanner.tsx` y `UpgradeProModal.tsx` para abrir directamente el checkout modal con el plan correspondiente preseleccionado, e incorporar la alerta visual de 3 días de gracia ante fallos de cobro.
- [ ] 3.3 Implementar el bloqueo de interfaz cuando el periodo de prueba ha expirado (`subscriptionStatus === "EXPIRED"`), obligando al usuario a suscribir un plan para reactivar su cuenta.
- [ ] 3.4 Conectar los botones de la tabla de precios en la Landing Page (`#pricing`) para iniciar el checkout en usuarios autenticados.

## 4. Verificación y Pruebas End-to-End

- [ ] 4.1 Ejecutar la suite de tests del proyecto para comprobar que todas las suites de frontend y backend pasen satisfactoriamente.
- [ ] 4.2 Probar el flujo completo: apertura de modal, generación de sesión de checkout, simulación/cobro exitoso, actualización de suscripción a `ACTIVE`, periodo de gracia y visualización de facturas descargables.
