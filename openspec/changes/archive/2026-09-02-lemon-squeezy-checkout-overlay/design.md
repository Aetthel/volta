# Technical Design: Lemon Squeezy Checkout Overlay Integration

## Context

Actualmente el frontend dispone de un modal multi-paso propio (`SubscriptionCheckoutModal`) con pasos de selección de plan, datos fiscales, resumen con cupón y pantalla de éxito. La integración nativa recomendada por Lemon Squeezy para Web Apps es utilizar su script de overlay (`lemon.js` / `@lemonsqueezy/lemonsqueezy.js`), el cual intercepta cualquier elemento `<a>` con la clase CSS `lemonsqueezy-button` y abre directamente la pasarela de pago segura sobre la aplicación sin abandonar la navegación.

## Goals / Non-Goals

**Goals:**
- Eliminar por completo el modal custom y todos sus subcomponentes en `components/checkout/`.
- Instalar la dependencia oficial `@lemonsqueezy/lemonsqueezy.js` e inicializar `window.createLemonSqueezy()` en el ciclo de vida del cliente.
- Implementar un helper centralizado para generar URLs de checkout con inyección dinámica de `checkout[custom][user_id]` y `checkout[email]`.
- Convertir los puntos de entrada de suscripción (`BillingSection`, `TrialBanner`, `UpgradeProModal`, `Landing Page`) a enlaces `<a>` con `lemonsqueezy-button` respetando el sistema de diseño Volta UI.
- Dejar comentarios claros `// TODO: Insertar URL del producto de Lemon Squeezy aquí` para que las URLs definitivas puedan configurarse fácilmente.
- Mantener la compilación limpia (Next.js build sin errores de tipos ni importaciones rotas).

**Non-Goals:**
- No modificar el backend ni los webhooks existentes (la recepción y procesamiento HMAC de webhooks ya funciona en backend).
- No alterar la lógica de cálculo de precios del backend o las tablas de base de datos.

## Decisions

### 1. Helper centralizado para URLs de Lemon Squeezy (`frontend/lib/lemonsqueezy.ts`)
- **Decisión**: Crear un módulo reutilizable `lib/lemonsqueezy.ts` que almacene las constantes de URL de producto con los comentarios TODO y una función utilitaria `buildLemonCheckoutUrl(productUrl, user)`.
- **Razón**: Evita duplicar lógica de formateo de parámetros URL (`checkout[custom][user_id]` y `checkout[email]`) en múltiples componentes y permite al usuario cambiar la URL base en un único sitio.
- **Alternativa**: Inyectar query params manualmente con concatenación de strings en cada componente. Rechazada por ser propensa a errores de encoding y dispersión de URLs.

### 2. Inicialización en el ciclo de vida de cliente (`Providers.tsx`)
- **Decisión**: Añadir `createLemonSqueezy()` dentro de un `useEffect` en `frontend/components/Providers.tsx` (o un subcomponente cliente `LemonSqueezyInitializer.tsx`) tras la carga del script `lemon.js`.
- **Razón**: `Providers.tsx` envuelve a toda la aplicación en el lado cliente y se ejecuta una sola vez tras la hidratación, garantizando que el DOM esté listo y que cualquier enlace `lemonsqueezy-button` sea interceptado.

### 3. Reemplazo de botones por `<a className="lemonsqueezy-button">`
- **Decisión**: En lugar de `button` con `onClick={() => setIsCheckoutOpen(true)}`, renderizar etiquetas `<a>` estilizadas con las clases de botón de Volta UI (`buttonVariants({ variant: "primary" })` o clases directas de diseño) y `className="lemonsqueezy-button ..."`.
- **Razón**: Lemon Squeezy Overlay detecta el evento click nativo en elementos con la clase `lemonsqueezy-button` y lee el atributo `href` para desplegar el iframe overlay.

## Risks / Trade-offs

- **[Riesgo]** Script `lemon.js` aún no cargado cuando el usuario hace clic en el botón.
  - **Mitigación**: Si el script tarda en cargar, el enlace `<a>` actúa como fallback abriendo la pasarela de Lemon Squeezy en una nueva pestaña sin romper el flujo de pago.
- **[Riesgo]** Usuario con sesión caducada o anónimo.
  - **Mitigación**: Si el usuario no tiene `id` o `email` en la sesión, la URL se construye sin los parámetros opcionales o redirige a `/register`.

## Migration Plan

1. Eliminar archivos del modal antiguo (`SubscriptionCheckoutModal.tsx`, `SubscriptionCheckoutModal.test.tsx`, `components/checkout/*`).
2. Instalar `@lemonsqueezy/lemonsqueezy.js` con `pnpm`.
3. Crear `lib/lemonsqueezy.ts` con helper de URLs y TODOs.
4. Añadir inicialización `window.createLemonSqueezy()` en `Providers.tsx`.
5. Actualizar `BillingSection.tsx`, `TrialBanner.tsx`, `UpgradeProModal.tsx` y `app/(landing)/page.tsx`.
6. Ejecutar `pnpm build` y tests para verificar integridad.
