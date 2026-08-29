# sidebar-system Specification

## Purpose
Especifica el comportamiento, diseño en tema claro e interactividad del componente Sidebar basado en la arquitectura 21st.dev para Volta.

## Requirements

### Requirement: Cabecera WorkspaceSwitcher en Tema Claro
El sistema SHALL presentar un selector de workspace con el avatar del negocio con fondo primario, nombre truncado y subtítulo del plan de suscripción (*Plan Básico* o *Plan Pro*).

#### Scenario: Visualización del workspace activo
- **GIVEN** un usuario autenticado en Volta
- **WHEN** carga cualquier vista del panel
- **THEN** la cabecera del sidebar muestra la inicial del negocio, el nombre comercial y el plan activo.

### Requirement: Modal de Búsqueda Integrada (Search / ⌘K)
El sistema SHALL permitir abrir un modal de búsqueda rápida al hacer clic en el ítem `Search` o mediante el atajo de teclado `⌘K` / `Ctrl+K`.

#### Scenario: Apertura y cierre del buscador
- **GIVEN** el sidebar cargado
- **WHEN** el usuario hace clic en `Search` o presiona `⌘K`
- **THEN** se despliega el modal flotante con foco en el campo de búsqueda, cerrándose al presionar `ESC` o hacer clic en el fondo.

### Requirement: Estructura de Navegación Jerárquica y Rutas
El sistema SHALL organizar los enlaces en grupo principal (`Inicio`, `Inbox`, `Analítica`) y grupo de gestión `Workspace` (`Agenda`, `Equipo`, `Clientes`).

#### Scenario: Navegación entre vistas
- **GIVEN** el menú desplegado
- **WHEN** el usuario selecciona una ruta
- **THEN** el sistema resalta el ítem activo con fondo de contraste `bg-black/5` y navega a la URL correspondiente.

### Requirement: Pie del Sidebar con Nueva Cita, Ajustes y Logout
El sistema SHALL disponer en la base del sidebar el botón destacado `+ Nueva Cita`, el enlace a `Ajustes` (`⌘,`) y la opción de cerrar sesión.

#### Scenario: Ejecución de cierre de sesión
- **GIVEN** el sidebar activo
- **WHEN** el usuario pulsa en `Log out`
- **THEN** NextAuth finaliza la sesión activa y redirige a `/login`.
