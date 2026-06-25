## Context

Actualmente, los trabajadores con rol `EMPLEADO` no tienen acceso al menú de Ajustes, pero es necesario que puedan modificar su perfil personal (nombre, email y contraseña). A su vez, se requiere que la configuración crítica del negocio y de mensajería quede reservada únicamente para los roles directivos (`JEFE` y `ADMIN`).

## Goals / Non-Goals

**Goals:**
- Añadir el enlace de "Ajustes" para el rol `EMPLEADO` en [Sidebar.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Sidebar.tsx) y [BottomNav.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/BottomNav.tsx).
- Condicionar la renderización de las pestañas "Mensajes y WhatsApp" y "Gestión del Negocio" en [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx) para que solo aparezcan si el rol no es `EMPLEADO`.
- Salvaguardar el renderizado del contenido de las pestañas exclusivas.

**Non-Goals:**
- Crear nuevas rutas o endpoints de backend.
- Cambiar los permisos de los modales de creación (eso se controla a nivel de vista principal).

## Decisions

### 1. Inclusión de Ajustes en la Navegación General
Modificaremos la inicialización de `navigationItems` / `navItems` para incluir el ítem Ajustes en el bloque `else` (roles `EMPLEADO`):
```tsx
  } else { // EMPLEADO
    navItems.push(
      { name: "Inicio", href: "/inicio", icon: LayoutDashboard },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Ajustes", href: "/ajustes", icon: Settings }, // Añadido
    );
  }
```

### 2. Ocultar Pestañas Exclusivas en la Vista de Ajustes
En [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx), agregaremos una validación por rol alrededor de los botones de mensajería y gestión:
```tsx
  {role !== "EMPLEADO" && (
    <>
      <Button ...>Mensajes y WhatsApp</Button>
      <Button ...>Gestión del Negocio</Button>
    </>
  )}
```

### 3. Forzar Contenido de Pestaña "Perfil" para Empleados
Para prevenir cualquier renderizado accidental de la configuración del negocio por un empleado, condicionaremos el contenido del tab principal:
```tsx
  {activeTab === "perfil" || role === "EMPLEADO" ? (
     /* Render Perfil y Seguridad */
  ) : ...
```

## Risks / Trade-offs

- **[Riesgo]** Un empleado malintencionado podría cambiar el estado de `activeTab` en memoria a "gestion".
  - *Mitigación:* La condición `role === "EMPLEADO"` invalida cualquier estado de `activeTab` distinto de `"perfil"`, forzando siempre la renderización del perfil de usuario y bloqueando el acceso a los componentes de administración del negocio.
