## ADDED Requirements

### Requirement: Acceso a Ajustes en Navegación para Empleados
El sistema SHALL incluir el enlace a "Ajustes" (apuntando a `/ajustes` con el icono de engranaje) en los componentes de navegación principal (`Sidebar` y `BottomNav`) para todos los roles de usuario (ADMIN, JEFE, EMPLEADO).

#### Scenario: Visualización de Ajustes para Empleado
- **WHEN** un usuario con el rol de EMPLEADO inicia sesión y se renderiza `Sidebar` o `BottomNav`
- **THEN** el sistema muestra el enlace "Ajustes" junto con los de Inicio, Agenda y Clientes.
