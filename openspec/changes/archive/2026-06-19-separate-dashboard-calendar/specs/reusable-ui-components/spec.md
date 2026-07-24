## ADDED Requirements

### Requirement: Agenda en Menús de Navegación

El sistema de navegación principal (tanto `Sidebar` en escritorio como `BottomNav` en dispositivos móviles) SHALL incluir un elemento de enlace directo para la vista de la "Agenda" utilizando el icono de calendario y apuntando a la ruta `/agenda`.

#### Scenario: Visualización del enlace de agenda en escritorio

- **WHEN** un usuario con rol de JEFE o EMPLEADO inicia sesión y carga el panel lateral `Sidebar` en escritorio
- **THEN** el sistema renderiza el enlace "Agenda" con el icono de calendario en el menú de navegación principal.

#### Scenario: Visualización del enlace de agenda en móvil

- **WHEN** un usuario con rol de JEFE o EMPLEADO carga la aplicación desde un dispositivo móvil
- **THEN** la barra de navegación inferior `BottomNav` incluye un acceso directo llamado "Agenda" con el icono de calendario correspondiente.
