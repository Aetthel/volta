## 1. Creación del Componente Canónico de Avatar

- [x] 1.1 Crear `frontend/components/ui/avatar.tsx` con soporte para paleta pastel determinista (7 tonos fijos), escala de 5 tamaños (`xs`, `sm`, `md`, `lg`, `xl`), formas semánticas (`person` vs `business`) y componente `<AvatarGroup />` <!-- id: 1.1 -->
- [x] 1.2 Exportar `Avatar` y `AvatarGroup` desde `frontend/components/ui/volta-ui.tsx` y actualizar `frontend/components/UserAvatar.tsx` como adaptador compatible <!-- id: 1.2 -->

## 2. Reemplazo Global en Todo el Código

- [x] 2.1 Integrar `AvatarGroup` y `Avatar` en [Header.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Header.tsx) para el grupo de estilistas/trabajadores y el menú de perfil <!-- id: 2.1 -->
- [x] 2.2 Reemplazar avatares en la tabla y modales de Clientes ([ClientsTable.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/clients/ClientsTable.tsx), [AddClientModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/AddClientModal.tsx)) <!-- id: 2.2 -->
- [x] 2.3 Reemplazar avatares en la tabla y modales de Equipo ([TeamTable.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/team/TeamTable.tsx), [InviteWorkerModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/InviteWorkerModal.tsx)) <!-- id: 2.3 -->
- [x] 2.4 Reemplazar avatares en Agenda, Dashboard y Citas ([UpcomingAppointmentsList.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/UpcomingAppointmentsList.tsx), [inicio/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/%28dashboard%29/inicio/page.tsx)) <!-- id: 2.4 -->
- [x] 2.5 Actualizar el selector de negocio en la barra lateral ([WorkspaceSwitcher.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/sidebar/WorkspaceSwitcher.tsx)) para usar `Avatar` con `type="business"` (`rounded-xl`) <!-- id: 2.5 -->
- [x] 2.6 Actualizar las secciones de perfil y negocio en Ajustes ([ProfileSection.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/settings/ProfileSection.tsx), [BusinessSection.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/settings/BusinessSection.tsx)) <!-- id: 2.6 -->

## 3. Validación y Tipado

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y validar la compilación sin errores <!-- id: 3.1 -->
