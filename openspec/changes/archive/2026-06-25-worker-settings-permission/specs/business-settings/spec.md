## ADDED Requirements

### Requirement: Restricción de Ajustes por Rol

El sistema SHALL restringir el acceso a las pestañas y secciones de configuración de la página de ajustes basándose en el rol del usuario actual. Los usuarios con rol `EMPLEADO` solo SHALL tener visibilidad y capacidad de modificación en la pestaña "Perfil y Seguridad". Las pestañas de "Mensajes y WhatsApp" y "Gestión del Negocio" SHALL ser visibles y editables únicamente por usuarios con rol `JEFE` o `ADMIN`.

#### Scenario: Trabajador visualiza Ajustes

- **WHEN** un usuario con rol `EMPLEADO` accede a la página de Ajustes `/ajustes`
- **THEN** el sistema no muestra los botones para cambiar a las pestañas de Mensajes y Gestión del Negocio, y visualiza únicamente el panel de Perfil y Seguridad.
