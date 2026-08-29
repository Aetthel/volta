## Context

TypeScript está configurado en modo estricto en el monorepo. Sin embargo, en capas de autenticación y componentes UI se habían acumulado casts manuales `as any` al acceder a propiedades de sesión añadidas en iteraciones anteriores.

## Goals / Non-Goals

**Goals:**
- Extender y consolidar las interfaces de NextAuth en `frontend/types/next-auth.d.ts`.
- Reemplazar todas las aserciones `(user as any)` y `(session.user as any)` en `auth.config.ts`, `Sidebar.tsx`, `ajustes/page.tsx` y `landing/page.tsx`.
- Tipar explícitamente retornos de llamadas a API de backend.

**Non-Goals:**
- No alterar esquemas de runtime de base de datos ni firmas de respuesta JSON de Express.

## Decisions

1. **Aumento Completo de Módulos `next-auth` y `next-auth/jwt`**:
   - Asegurar que `Session.user`, `User` y `JWT` declaren exactamente todas las propiedades (`id`, `role`, `businessId`, `businessName`, `businessLogoUrl`, `subscriptionStatus`, `subscriptionPlan`, `themeColor`, `fontSizeLevel`, `borderRadiusLevel`).
2. **Eliminación Directa de Casts `as any`**:
   - Limpiar el código en `auth.config.ts`, `Sidebar.tsx`, `ajustes/page.tsx`, etc., para acceder limpiamente a `session.user.property`.

## Risks / Trade-offs

- **[Incompatibilidad con tipos opcionales]** → Se mitiga usando optional chaining `session?.user?.businessId` con valores por defecto seguros (`|| ""`).
