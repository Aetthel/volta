## 1. Limpieza de Componentes Obsoletos

- [x] 1.1 Eliminar el componente `SubscriptionCheckoutModal.tsx`, su test `SubscriptionCheckoutModal.test.tsx` y todos los archivos del directorio `frontend/components/checkout/`.
- [x] 1.2 Limpiar estados y variables de apertura/cierre de modal (`isCheckoutOpen`, `checkoutPlan`, imports dinámicos) en `BillingSection.tsx`, `TrialBanner.tsx`, `UpgradeProModal.tsx` y `app/(landing)/page.tsx`.

## 2. Instalación de Dependencias e Inicialización Global

- [x] 2.1 Instalar el paquete `@lemonsqueezy/lemonsqueezy.js` en el frontend y verificar su presencia en `package.json`.
- [x] 2.2 Configurar la inicialización global en el cliente ejecutando `window.createLemonSqueezy()` dentro de `useEffect` en `Providers.tsx` (o un inicializador dedicado) y verificar la carga del script `lemon.js`.

## 3. Utilidades y Generación Dinámica de Enlaces de Checkout

- [x] 3.1 Crear `frontend/lib/lemonsqueezy.ts` con constantes de producto con comentarios TODO (`// TODO: Insertar URL del producto de Lemon Squeezy aquí`) y la función utilitaria `buildLemonCheckoutUrl` con soporte para `checkout[custom][user_id]` y `checkout[email]`.
- [x] 3.2 Crear tests unitarios en `frontend/lib/lemonsqueezy.test.ts` para verificar la correcta construcción de URLs y concatenación de query parameters.

## 4. Refactorización de Botones a Enlaces Lemon Squeezy

- [x] 4.1 Reemplazar el botón de suscripción en `frontend/components/settings/BillingSection.tsx` por un elemento `<a>` con la clase `lemonsqueezy-button` y URL dinámica con datos del usuario.
- [x] 4.2 Reemplazar el botón de selección de plan en `frontend/components/TrialBanner.tsx` por un elemento `<a>` con la clase `lemonsqueezy-button` y URL dinámica.
- [x] 4.3 Reemplazar el botón CTA en `frontend/components/UpgradeProModal.tsx` por un elemento `<a>` con la clase `lemonsqueezy-button` y URL dinámica.
- [x] 4.4 Actualizar los botones de contratación en `frontend/app/(landing)/page.tsx` para que usuarios autenticados utilicen enlaces `<a>` con clase `lemonsqueezy-button` y URLs dinámicas de Básico y Pro.

## 5. Verificación y Calidad de Código

- [x] 5.1 Ejecutar `pnpm --filter frontend test` y verificar que todos los tests pasen sin errores.
- [x] 5.2 Ejecutar `pnpm --filter frontend build` para asegurar que el proyecto compila limpiamente sin tipos rotos ni importaciones faltantes.
