# Technical Design: Sidebar 21st.dev en Tema Claro

## Arquitectura

### 1. `frontend/components/Sidebar.tsx`
El componente utiliza la estructura visual y de interacción provista por el usuario, afinada para el tema claro:
- **Colores y Tokens de Tema Claro**:
  - Fondo del sidebar: `bg-surface-container-low` (o `bg-[#fbfbfb]`) con `border-r border-outline-variant/60`.
  - Estados activos: `bg-black/5 text-foreground font-medium rounded-[6px]`.
  - Estados hover: `hover:bg-black/5 text-muted-foreground hover:text-foreground/90`.
  - Kbd shortcuts: `bg-background/80 border border-border/50 text-[10px] font-mono text-muted-foreground/70`.
  - Avatar: `w-8 h-8 rounded-[6px] bg-primary text-primary-foreground font-semibold text-[13px] shadow-sm`.
- **Search Modal Integrado**:
  - Al pulsar en `Search` o presionar `⌘K` / `Ctrl+K`, se abre el diálogo centrado con backdrop blur, campo de búsqueda con autoFocus y tecla de salida `ESC`.
- **Navegación Next.js Link**:
  - Cada `NavItem` enlaza mediante `next/link` a la ruta correspondiente, detectando `pathname === item.href` para el estado activo.
- **Acción Nueva Cita**:
  - Botón integrado en la base del sidebar con icono `Plus`, fondo `bg-primary text-white` y tipografía `text-[13px] font-semibold`.
- **Cierre de Sesión**:
  - Ejecución de `signOut({ callbackUrl: "/login" })` desde el ítem de logout.

### 2. Vistas `/inbox` y `/equipo`
- `frontend/app/(dashboard)/inbox/page.tsx`: Layout dashboard con Sidebar + PageHeader + Empty state limpio.
- `frontend/app/(dashboard)/equipo/page.tsx`: Layout dashboard con Sidebar + PageHeader + Empty state limpio y enlace a ajustes de trabajadores.
