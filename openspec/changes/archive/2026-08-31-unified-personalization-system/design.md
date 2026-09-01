## Context

Ver `proposal.md` para el contexto y la motivación de este cambio. El sistema actual presenta conflictos entre el token JWT de NextAuth, variables dispersas de `localStorage`, mutaciones globales en `document.documentElement` y la base de datos PostgreSQL en Prisma.

## Goals / Non-Goals

**Goals:**
- Crear una única capa reactiva (`ThemeProvider` y `useTheme`) para la gestión y aplicación del tema visual en toda la aplicación.
- Implementar una cookie ligera `volta_theme_prefs` que permita a `RootLayout` en el servidor aplicar los estilos correctos en SSR sin FOUC.
- Corregir el ciclo de sincronización del JWT de NextAuth en `auth.config.ts` para que `update()` capture inmediatamente las actualizaciones de personalización del negocio.
- Aislar el estilado de vistas públicas (Landing, Login, Registro y Reservas Públicas) para que no contaminen las variables CSS globales del panel administrativo.
- Sincronizar optimistamente en el cliente y persistir en la base de datos PostgreSQL con rollback automático ante errores.

**Non-Goals:**
- No se cambia el esquema de base de datos de Prisma (las columnas `themeColor`, `fontSizeLevel`, `borderRadiusLevel` en `Business` ya existen y son adecuadas).
- No se implementa un generador arbitrario de colores hexadecimales (se mantienen las paletas de marca oficiales `CLINICAL_ELEGANCE`, `ORCHID_SERENITY`, `ORGANIC_VITALITY`, `WARM_SAND` y sus escalas estandarizadas).

## Decisions

### 1. Cookie ligera `volta_theme_prefs` frente a depender del JWT en SSR
- **Decisión**: Utilizar una cookie de cliente/servidor ligera `volta_theme_prefs` codificada en JSON simple (ej. `{"theme":"WARM_SAND","font":"MEDIUM","radius":"LARGE"}`) que se lee en `RootLayout` (`layout.tsx`).
- **Alternativas consideradas**:
  - *Depender únicamente de `auth()` y el JWT en SSR*: El JWT puede demorarse en reemitirse o requerir roundtrips criptográficos innecesarios.
  - *LocalStorage exclusivo*: Provoca FOUC (parpadeo blanco/estilo por defecto hasta que el cliente monta y ejecuta el script).
- **Razón**: La cookie ligera permite que el primer byte de HTML enviado desde el servidor contenga las variables CSS exactas, eliminando completamente el parpadeo visual.

### 2. Contexto Centralizado `ThemeContext` y `ThemeProvider`
- **Decisión**: Montar un `ThemeProvider` en `Providers.tsx` que gestione el estado activo en React, aplique las variables CSS en el DOM, actualice la cookie `volta_theme_prefs`, invoque el backend y notifique a NextAuth.
- **Alternativas consideradas**:
  - *Mantener `ThemeInitializer` con `useEffect` suelto*: Desorganizado y susceptible a condiciones de carrera y dependencias desactualizadas.
- **Razón**: Centraliza toda la lógica de mutación, validación, rollback y consumo en un solo hook `useTheme()`.

### 3. Aislamiento de Temas Públicos mediante Contenedores Locales
- **Decisión**: Para las páginas públicas (Landing, Login, Registro) y el portal de reservas públicas (`/booking/[businessId]`), aplicar las variables CSS en el elemento contenedor de la página o resetear limpiamente sin mutar de forma destructiva las propiedades globales del `<html>` que necesita el dashboard.
- **Alternativas consideradas**:
  - *Llamar a `applyThemeColors(document.documentElement)` en cada `useEffect` de página*: Contamina el DOM global en transiciones de cliente Next.js (SPA).
- **Razón**: Evita que visitar una reserva pública o volver de la landing deje el dashboard corporativo en un tema erróneo.

### 4. Corrección en `auth.config.ts` para capturar `update()`
- **Decisión**: Adaptar el callback `jwt` para procesar payloads tanto en formato plano como anidados en `session.user` o `session.business`.
- **Razón**: Asegura que el token de sesión siempre esté en sincronía con los cambios realizados desde la interfaz de Ajustes.

## Risks / Trade-offs

- **[Riesgo] Discrepancia temporal si el usuario navega entre múltiples pestañas** → **Mitigación**: `ThemeProvider` escucha eventos de cambio en cookies/canales y refresca el estado si detecta modificaciones en otra pestaña.
- **[Riesgo] Fallo de red al guardar en base de datos** → **Mitigación**: La mutación optimista se revierte al valor previo y se emite un toast de advertencia si la petición HTTP `PUT /business/:id` retorna error.

## Migration Plan

1. Crear `frontend/context/ThemeContext.tsx` y exportar `useTheme()`.
2. Actualizar `frontend/lib/theme.ts` con helpers tipados para la gestión de la cookie `volta_theme_prefs`.
3. Actualizar `frontend/app/layout.tsx` para leer la cookie ligera de preferencias en SSR y renderizar estilos iniciales.
4. Ajustar `frontend/components/Providers.tsx` reemplazando `ThemeInitializer` por `ThemeProvider`.
5. Actualizar `frontend/auth.config.ts` para manejar adecuadamente el trigger `update`.
6. Refactorizar `frontend/components/settings/PersonalizationSection.tsx` y `frontend/app/(dashboard)/ajustes/page.tsx` para usar `useTheme()`.
7. Aislar los estilos en `frontend/app/(landing)/page.tsx`, `frontend/app/(auth)/login/page.tsx`, `frontend/app/(auth)/register/page.tsx` y `frontend/app/booking/[businessId]/page.tsx`.
8. Ejecutar pruebas unitarias y de integración de frontend para verificar persistencia y ausencia de regresiones.
