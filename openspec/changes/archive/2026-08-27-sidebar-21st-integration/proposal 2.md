# Proposal: Integración del Sidebar 21st.dev en Tema Claro para Volta

## Contexto y Motivación
El usuario ha proporcionado el código fuente exacto del componente `dashboard-sidebar` de 21st.dev para ser implementado como el sidebar principal de Volta en **tema claro**.
El componente debe adaptarse a la navegación y rutas reales de Volta:
- **Header**: `WorkspaceSwitcher` con avatar cuadrado de negocio `[ E ]`, nombre del negocio y etiqueta de plan (*Plan Básico* / *Plan Pro*).
- **Search**: Acción de búsqueda que despliega el modal de búsqueda rápida (`⌘K` / ESC para cerrar).
- **Navegación General**:
  - `Inicio` (`/inicio`, `LayoutDashboard`)
  - `Inbox` (`/inbox`, `Inbox`)
  - `Analítica` (`/analitica`, `Activity`, con bloqueo `PRO` para Plan Básico)
- **Navegación Gestión (Workspace)**:
  - `Agenda` (`/agenda`, `Calendar`)
  - `Equipo` (`/equipo`, `Users`)
  - `Clientes` (`/clientes`, `Globe` / `UserCheck`)
- **Zona Inferior (Footer)**:
  - Botón estilizado `+ Nueva Cita` integrado orgánicamente.
  - `Ajustes` (`/ajustes`, `Settings`, shortcut `⌘,`).
  - `Cerrar Sesión` (`LogOut` que invoca `signOut({ callbackUrl: "/login" })`).

## Alcance
- Integración del código exacto del sidebar en `frontend/components/Sidebar.tsx` en tema claro.
- Rutas placeholder `/inbox` y `/equipo` creadas con layout responsive.
- Modal de búsqueda interactivo con atajo de teclado (`⌘K` / `Ctrl+K` y `ESC`).
- Respeto a los permisos de plan (`hasFeatureAccess`) para Analítica y modal de actualización `UpgradeProModal`.
