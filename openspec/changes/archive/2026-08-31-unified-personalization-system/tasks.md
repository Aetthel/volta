## 1. Contexto y Cookie de Personalización

- [x] 1.1 Crear utilidades para la cookie ligera `volta_theme_prefs` en `frontend/lib/theme.ts` y verificar que serializa, parsea y valida valores con fallbacks seguros.
- [x] 1.2 Implementar `ThemeContext` y `ThemeProvider` en `frontend/context/ThemeContext.tsx` con soporte para mutaciones optimistas, actualización de cookies y sincronización reactiva, verificando que exporta el hook `useTheme`.

## 2. Integración en Layout y NextAuth

- [x] 2.1 Actualizar `frontend/app/layout.tsx` para leer `volta_theme_prefs` desde los headers/cookies del servidor e inyectar variables CSS iniciales sin FOUC, verificando que se elimina el script inline obsoleto.
- [x] 2.2 Reemplazar `ThemeInitializer` por `ThemeProvider` dentro de `frontend/components/Providers.tsx` y verificar que el árbol de componentes queda envuelto por el nuevo proveedor.
- [x] 2.3 Ajustar los callbacks `jwt` y `session` en `frontend/auth.config.ts` para sincronizar correctamente las actualizaciones de `themeColor`, `fontSizeLevel` y `borderRadiusLevel` cuando se invoca `update()`.

## 3. Refactorización de Vistas de Ajustes y Personalización

- [x] 3.1 Refactorizar `frontend/components/settings/PersonalizationSection.tsx` para utilizar `useTheme()` y coordinar el guardado en base de datos (`apiClient.business.update`) con feedback de toast y rollback ante errores.
- [x] 3.2 Refactorizar `frontend/app/(dashboard)/ajustes/page.tsx` para eliminar la cadena de fallbacks conflictiva (`session || localColor || data`) y basar el estado en la base de datos y `useTheme()`.

## 4. Aislamiento de Vistas Públicas y Reservas

- [x] 4.1 Aislar la aplicación de temas en `frontend/app/(landing)/page.tsx`, `frontend/app/(auth)/login/page.tsx` y `frontend/app/(auth)/register/page.tsx` para evitar que muten destructivamente `document.documentElement`.
- [x] 4.2 Actualizar `frontend/app/booking/[businessId]/page.tsx` para aplicar las variables CSS exclusivamente en el contenedor de reservas públicas sin contaminar el layout administrativo.

## 5. Verificación y Pruebas

- [x] 5.1 Ejecutar suite de pruebas (`npm test` o `npm run build` en frontend) y verificar que no existen errores de compilación ni fallos de tipado TypeScript.
- [x] 5.2 Validar el cambio completo con `openspec validate unified-personalization-system --strict` y comprobar que todos los artefactos cumplen las directrices.
