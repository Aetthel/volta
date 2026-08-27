# Tasks: Integración del Sidebar 21st.dev en Tema Claro

## Phase 1: Rutas de Navegación (/inbox y /equipo)
- [x] 1.1 Asegurar que `/inbox` (`frontend/app/(dashboard)/inbox/page.tsx`) y `/equipo` (`frontend/app/(dashboard)/equipo/page.tsx`) estén disponibles y tipadas <!-- id: 1.1 -->

## Phase 2: Implementación de Sidebar.tsx en Tema Claro
- [x] 2.1 Implementar `WorkspaceSwitcher` con avatar primario, nombre de negocio y plan en tema claro <!-- id: 2.1 -->
- [x] 2.2 Implementar modal de búsqueda `Search` (`⌘K` y `ESC`) <!-- id: 2.2 -->
- [x] 2.3 Implementar `NavItem` y `NavGroup` con tema claro (`bg-black/5` activo, hover sutil) <!-- id: 2.3 -->
- [x] 2.4 Configurar los grupos de navegación:
  - Principal: `Search` (modal), `Inicio` (`/inicio`), `Inbox` (`/inbox`, badge 12 o dinámico), `Analítica` (`/analitica`, lock PRO en Básico)
  - Workspace: `Agenda` (`/agenda`), `Equipo` (`/equipo`), `Clientes` (`/clientes`)
- [x] 2.5 Integrar botón `+ Nueva Cita` en la base del sidebar con el diseño elegante de 21st.dev <!-- id: 2.5 -->
- [x] 2.6 Integrar enlaces inferiores de `Ajustes` (`/ajustes`, shortcut `⌘,`) y `Log out` (`signOut`) <!-- id: 2.6 -->
- [x] 2.7 Mantener soporte responsive y colapsable <!-- id: 2.7 -->

## Phase 3: Validación y Pruebas
- [x] 3.1 Validar con OpenSpec CLI <!-- id: 3.1 -->
- [x] 3.2 Ejecutar pruebas de vitest y build de producción de Next.js <!-- id: 3.2 -->
