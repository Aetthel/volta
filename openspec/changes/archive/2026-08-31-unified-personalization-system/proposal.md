## Why

Actualmente el sistema de personalización de temas (paleta de color de marca, escala tipográfica y curvatura de bordes) presenta inconsistencias graves y desincronización entre 5 fuentes de estado fragmentadas: la base de datos PostgreSQL, el token JWT de la cookie de NextAuth, variables de LocalStorage, un script síncrono incompleto en `<head>` y llamadas directas y descontroladas a `applyThemeColors` en el DOM.

Esto provoca que las actualizaciones de personalización no se propaguen al token de sesión, que las cookies obsoletas sobreescriban los datos frescos de la base de datos en `/ajustes`, y que la navegación SPA hacia páginas públicas (landing, reservas o login) contamine globalmente el DOM dejando el dashboard en estados visuales inconsistentes. Es necesario unificar la gestión de temas mediante una arquitectura reactiva, con soporte SSR libre de parpadeos (FOUC), persistencia atómica en BBDD y cookies dedicadas, y aislamiento estricto de estilos por ámbito (scoped theming).

## What Changes

- **Arquitectura de Sincronización Unificada**: Creación de un `ThemeProvider` y hook `useTheme()` / `usePersonalization()` centralizado como única fuente de verdad reactiva para el tema, escala de fuentes y radio de bordes.
- **Cookie Ligera de Preferencias (`volta_theme_prefs`)**: Sustitución del uso disperso de `localStorage` y la dependencia del JWT de NextAuth para renderizado inicial por una cookie ligera de preferencias leída en SSR (`RootLayout`) para garantizar cero FOUC.
- **Corrección del Ciclo de Vida de Sesión NextAuth**: Modificación del callback `jwt` y `session` en `auth.config.ts` y del flujo de `update()` en frontend para que las mutaciones de personalización actualicen de forma inmediata y consistente el token de sesión.
- **Prioridad de Datos Correcta en UI**: Refactorización de la pantalla de ajustes (`PersonalizationSection.tsx` y `ajustes/page.tsx`) para sincronizar optimistamente la UI, persistir en PostgreSQL mediante `apiClient.business.update`, sincronizar la cookie ligera y actualizar la sesión sin race conditions ni sobrescrituras de valores obsoletos.
- **Aislamiento de Temas (Scoped Theming)**: Eliminación de las mutaciones directas y globales en `document.documentElement` en páginas públicas (`landing`, `login`, `register` y `booking/[businessId]`). Las páginas de reserva pública y autenticación usarán contenedores aislados o contextos locales sin contaminar el DOM global del panel administrativo.
- **Eliminación de Código Redundante**: Retirada de `ThemeInitializer.tsx`, scripts manuales desalineados en `layout.tsx` y lecturas dispersas de `localStorage`.

## Capabilities

### New Capabilities
- `unified-theming-engine`: Motor y contexto centralizado de personalización (`ThemeProvider`), lectura de cookies ligeras en SSR, inyección reactiva de variables CSS y aislamiento de estilos entre entornos públicos y privados.

### Modified Capabilities
- `business-settings`: Requisito de sincronización atómica y persistencia bidireccional de la personalización visual del negocio (`themeColor`, `fontSizeLevel`, `borderRadiusLevel`) entre el panel de configuración, la base de datos y la sesión activa del usuario.

## Impact

- **Frontend Core**: `app/layout.tsx`, `components/Providers.tsx`, `lib/theme.ts`, creación de `context/ThemeContext.tsx` y `hooks/useTheme.ts`.
- **Autenticación**: `auth.config.ts`, `auth.js`, `types/next-auth.d.ts`.
- **Vistas y Componentes**: `app/(dashboard)/ajustes/page.tsx`, `components/settings/PersonalizationSection.tsx`, `components/ThemeInitializer.tsx` (deprecación/reemplazo), `app/(landing)/page.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/booking/[businessId]/page.tsx`.
- **APIs / Backend**: `apiClient.business.update`, compatibilidad y consistencia con el modelo `Business` de Prisma.
- **Dependencias**: Sin dependencias externas adicionales requeridas; utiliza las capacidades nativas de Next.js Cookies API y React Context.
