## Why

Actualmente en Volta la representación visual de avatares e identidades (clientes, trabajadores, usuarios administradores y logotipos de negocio) se encuentra fragmentada entre componentes ad-hoc (`UserAvatar`, `FaceIcon`, `WorkspaceSwitcher`, etiquetas personalizadas en tablas y modales), generando inconsistencias de tamaño, formas, colores de fallback y estilos de superposición.

Es necesario consolidar un **Sistema Unificado de Avatares** (`<Avatar />` y `<AvatarGroup />`) que se aplique en el 100% de la plataforma con reglas visuales estrictas: diferenciación de forma (personas vs negocios), paleta pastel determinista para iniciales, escala de 5 tamaños fijos, ausencia de microindicadores invasivos y soporte de superposición grupal escalable.

## What Changes

- **Componente Canónico `<Avatar />` y `<AvatarGroup />`**: Creación del componente atómico en `frontend/components/ui/avatar.tsx` y re-exportación centralizada en `frontend/components/ui/volta-ui.tsx`.
- **Paleta Pastel Determinista**: Implementación de una función hash para asignar colores pastel armónicos fijos (Verde Salvia, Rosa Empolvado, Lavanda, Melocotón, Azul Cielo, Malva Suave, Menta Pastel) a partir del nombre o ID cuando no exista foto subida.
- **Diferenciación de Forma Semántica**:
  - Personas (Clientes, Trabajadores, Usuarios): Circulares (`rounded-full`).
  - Negocios y Sedes: Cuadrados redondeados (`rounded-xl`).
- **Escala de Tamaños Estandarizada**: 5 medidas únicas (`xs`: 24px, `sm`: 32px, `md`: 40px [default], `lg`: 56px, `xl`: 80px).
- **Agrupación de Avatares Escalable (`<AvatarGroup />`)**: Superposición fluida (`-space-x-2.5`) con corte de borde y píldora neutral `+N` cuando se supere el máximo de avatares visibles.
- **Diseño Limpio Sin Microindicadores**: Eliminación de puntos de estado e insignias invasivas en los avatares para preservar la estética minimalista.
- **Reemplazo Global y Exhaustivo en Todo el Código**:
  - Encabezado ([Header.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Header.tsx))
  - Listado y Modales de Clientes ([ClientsTable.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/clients/ClientsTable.tsx), [AddClientModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/AddClientModal.tsx))
  - Listado y Modales de Equipo ([TeamTable.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/team/TeamTable.tsx), [InviteWorkerModal.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/InviteWorkerModal.tsx))
  - Agenda y Citas ([UpcomingAppointmentsList.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/UpcomingAppointmentsList.tsx), [inicio/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/%28dashboard%29/inicio/page.tsx))
  - Selector de Negocio ([WorkspaceSwitcher.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/sidebar/WorkspaceSwitcher.tsx))
  - Ajustes de Perfil y Negocio ([ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/%28dashboard%29/ajustes/page.tsx))

## Capabilities

### Modified Capabilities
- `reusable-ui-components`: Añadir el requisito y especificación del sistema unificado de Avatar y AvatarGroup en toda la plataforma Volta.

## Impact

- `frontend/components/ui/avatar.tsx` (nuevo componente canónico)
- `frontend/components/ui/volta-ui.tsx` (re-export)
- `frontend/components/UserAvatar.tsx` (deprecado/redireccionado a nuevo Avatar)
- `frontend/components/Header.tsx`
- `frontend/components/clients/ClientsTable.tsx`
- `frontend/components/team/TeamTable.tsx`
- `frontend/components/UpcomingAppointmentsList.tsx`
- `frontend/components/sidebar/WorkspaceSwitcher.tsx`
- `frontend/app/(dashboard)/ajustes/page.tsx`
- `frontend/app/(dashboard)/inicio/page.tsx`
- `frontend/app/(dashboard)/inbox/page.tsx`
- `frontend/app/admin/page.tsx`
