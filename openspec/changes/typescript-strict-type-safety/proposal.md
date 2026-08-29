## Why

El uso de `as any` y tipos no tipados (`any`) en NextAuth, `Sidebar.tsx`, `auth.config.ts` y componentes del dashboard degrada la seguridad en tiempo de compilación y expone el sistema a errores en tiempo de ejecución. Reforzar el tipado estricto de TypeScript en toda la aplicación asegura autocompletado fiable, previene regresiones y garantiza la sincronización entre modelos de sesión y dominio.

## What Changes

- **Eliminación de Casts Inseguros (`as any`)**: Eliminar aserciones innecesarias de `(session.user as any)` y `(user as any)` aprovechando las declaraciones aumentadas de NextAuth en `next-auth.d.ts`.
- **Tipado Estricto de Sesión y Roles**: Utilizar uniones discriminadas y tipos literales para `role: "ADMIN" | "JEFE" | "EMPLEADO"`, `themeColor`, `fontSizeLevel` y `borderRadiusLevel`.
- **Tipado Fuerte de Eventos y Callbacks**: Reemplazar parámetros implícitos o genéricos por tipos de dominio estrictos en `AgendaPage` y `clientes/page.tsx`.

## Capabilities

### New Capabilities
<!-- No new functional business capabilities are being introduced -->

### Modified Capabilities
- `project-modular-structure`: Refuerzo de la seguridad de tipos TypeScript y contratos de interfaz en todo el frontend.

## Impact

- **Frontend Core**: `auth.config.ts`, `proxy.ts`, `components/Sidebar.tsx`, `app/(dashboard)/ajustes/page.tsx`, `types/next-auth.d.ts`.
- **Type Safety**: 0 usos de `as any` en flujos de sesión y modelos de dominio.
