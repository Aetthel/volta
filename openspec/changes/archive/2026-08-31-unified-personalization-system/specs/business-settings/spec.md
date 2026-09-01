## ADDED Requirements

### Requirement: Sincronización Bidireccional de Personalización en Ajustes
El sistema SHALL sincronizar de forma bidireccional los valores de personalización del negocio (`themeColor`, `fontSizeLevel`, `borderRadiusLevel`) entre la vista de Ajustes, la base de datos PostgreSQL, la cookie de preferencias y el token de sesión de NextAuth, priorizando siempre la verdad persistida de la base de datos sobre cachés o tokens locales obsoletos.

#### Scenario: Guardado y recarga de personalización en Ajustes
- **WHEN** un usuario con rol `JEFE` o `ADMIN` modifica la paleta de color o escala en la sección de personalización
- **THEN** los cambios se persisten en la base de datos, se actualiza la sesión y la cookie activa, y al recargar la página se reflejan exactamente los nuevos valores configurados
