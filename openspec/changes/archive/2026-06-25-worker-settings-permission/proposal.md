## Why

Actualmente, los trabajadores con rol `EMPLEADO` no tienen acceso a la vista de Ajustes desde los menús de navegación (Sidebar y BottomNav), y si accedieran, verían todas las secciones de configuración. Los trabajadores deben tener la posibilidad de gestionar su perfil y seguridad (contraseña/datos personales), pero no deben ver ni modificar la configuración de mensajería/WhatsApp ni la gestión global del negocio (salones, empleados, horarios, servicios), que son de uso exclusivo para el rol `JEFE` y `ADMIN`.

## What Changes

- **Menú de Navegación**: Permitir que los usuarios con rol `EMPLEADO` vean el enlace "Ajustes" en el [Sidebar](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Sidebar.tsx) y en el [BottomNav](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/BottomNav.tsx).
- **Control de Pestañas en Ajustes**: En la página de ajustes [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx), ocultar las pestañas "Mensajes y WhatsApp" y "Gestión del Negocio" si el usuario tiene el rol `EMPLEADO`.
- **Restricción de Acceso a Contenidos**: Bloquear el renderizado y acceso a los contenidos de las pestañas exclusivas si el rol es `EMPLEADO`, redirigiendo o forzando la visualización únicamente de "Perfil y Seguridad".

## Capabilities

### New Capabilities

_(Ninguna)_

### Modified Capabilities

- `reusable-ui-components`: Modificar el comportamiento de navegación (Sidebar y BottomNav) para incluir Ajustes para empleados.
- `business-settings`: Modificar el control de acceso en la vista de Ajustes basándose en el rol del usuario (JEFE/ADMIN vs EMPLEADO).

## Impact

- **Navegación**:
  - `frontend/components/Sidebar.tsx`
  - `frontend/components/BottomNav.tsx`
- **Páginas**:
  - `frontend/app/ajustes/page.tsx`
