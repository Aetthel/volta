# unified-theming-engine Specification

## Purpose
Proporciona un motor centralizado de personalización y theming para Volta que gestiona paletas de color, escalas de texto y radios de borde de forma reactiva, sincronizada con cookies de renderizado SSR sin parpadeos y aislada por ámbitos.

## Requirements

### Requirement: Centralized Theme Context and Reactive State
El sistema SHALL proveer un contexto global de theming (`ThemeProvider` / `useTheme`) como única fuente de verdad reactiva en el cliente para los valores activos de `themeColor`, `fontSizeLevel` y `borderRadiusLevel`.

#### Scenario: Acceso y reactividad del tema en componentes
- **WHEN** un componente consume el hook `useTheme`
- **THEN** recibe los valores normalizados actuales de personalización y las funciones de mutación optimista

### Requirement: Zero-FOUC Server-Side Rendering via Lightweight Cookie
El sistema SHALL leer las preferencias visuales activas desde una cookie dedicada (`volta_theme_prefs`) durante el renderizado del servidor en `RootLayout` para inyectar los estilos CSS variables en el elemento raíz sin provocar parpadeos visuales (FOUC).

#### Scenario: Carga inicial de página con preferencias personalizadas
- **WHEN** un usuario solicita una página del sistema con una cookie `volta_theme_prefs` válida
- **THEN** el servidor inyecta las variables CSS correspondientes en `<html style="...">` en la primera respuesta HTML

### Requirement: Scoped Theming for Public and Isolated Views
El sistema SHALL aislar las vistas públicas (landing page, pantallas de login/registro y portal de reservas públicas de clientes) para que su visualización específica o predeterminada no sobrescriba ni contamine las variables CSS globales del panel administrativo durante la navegación cliente (SPA).

#### Scenario: Navegación entre portal de reservas y panel de control
- **WHEN** un usuario autenticado navega hacia una página de reservas públicas y posteriormente regresa al panel
- **THEN** el panel de control mantiene intacta la personalización configurada para su negocio

### Requirement: Atomic Mutation and Fallback Rollback
El sistema SHALL aplicar las actualizaciones de tema de forma optimista inmediata en la interfaz y sincronizar de forma atómica la cookie de preferencias, el endpoint de actualización del negocio en el backend y el token de sesión, revirtiendo el estado en caso de error de red.

#### Scenario: Fallo de red al guardar personalización
- **WHEN** la llamada al API de guardado falla durante una mutación de tema
- **THEN** el sistema revierte los valores al estado previo y muestra una notificación de error al usuario
