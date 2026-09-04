## ADDED Requirements

### Requirement: Sistema unificado de notificaciones toast
El sistema SHALL proporcionar un componente central de notificaciones toast (`<Toaster />`) y una API declarativa global (`toast.success`, `toast.error`, `toast.warning`, `toast.info`, `toast.whatsapp`) accesible desde cualquier componente o hook de la aplicación sin requerir paso de props (prop drilling).

#### Scenario: Disparo de notificación de éxito
- **WHEN** una acción de usuario (guardar cliente, actualizar horario, invocar servicio) se completa satisfactoriamente
- **THEN** el sistema invoca `toast.success(mensaje)` y renderiza una notificación flotante con borde sutil, icono semántico de verificación (`CheckCircle2`) y texto contrastado en base a los tokens de Volta UI.

#### Scenario: Disparo de notificación de error con icono semántico
- **WHEN** una petición de red o validación de formulario falla en cualquier pantalla (incluyendo ajustes y perfiles)
- **THEN** el sistema invoca `toast.error(mensaje)` y renderiza una tarjeta con token semántico de error (`bg-error/10`, `text-error`), icono de advertencia/error (`AlertCircle`), nunca mostrando iconos de éxito ni colores verdes para estados fallidos.

#### Scenario: Notificación especializada de WhatsApp y consentimiento LOPD
- **WHEN** el usuario reenvía o genera un mensaje de consentimiento LOPD o confirmación de WhatsApp
- **THEN** el sistema invoca `toast.whatsapp({ phone, message })` y muestra una notificación con el icono distintivo de WhatsApp/mensaje y el número de teléfono formateado en negrita.

#### Scenario: Apilamiento dinámico y cierre interactivo
- **WHEN** ocurren múltiples eventos o notificaciones en un breve intervalo de tiempo
- **THEN** el sistema apila verticalmente hasta 3 tarjetas simultáneas de forma suave sin sobreescribir pixel a pixel la posición anterior, y permite el descarte manual mediante botón de cierre (`X`) o gesto táctil de arrastre (swipe).

#### Scenario: Posicionamiento responsivo seguro
- **WHEN** la aplicación se visualiza en ordenadores de escritorio (viewport >= 768px)
- **THEN** las notificaciones se muestran en la esquina superior derecha (`top-right`) respetando los márgenes del layout.
- **WHEN** la aplicación se visualiza en dispositivos móviles (viewport < 768px)
- **THEN** las notificaciones se muestran en la parte superior centrada (`top-center`), garantizando que no colisionen ni tapen la barra de navegación inferior (`BottomNav`) ni el botón flotante de acción (FAB).

### Requirement: Eliminación de notificaciones ad-hoc y diálogos bloqueantes
El sistema SHALL sustituir todos los contenedores locales flotantes de `<Alert>`, divs con colores planos fijos y llamadas a `window.alert()` del navegador en las páginas del dashboard por el sistema unificado de toasts.

#### Scenario: Feedback en clientes y equipo sin alertas nativas
- **WHEN** se crea, edita o elimina un cliente o miembro del equipo, o se produce un error durante la operación
- **THEN** el sistema utiliza `toast.success()` o `toast.error()` en lugar de estados locales independientes (`showConsentToast`, `showGeneralToast`, `showToast`) o cuadros modales `window.alert()`.

#### Scenario: Corrección semántica y eliminación de prop drilling en Ajustes
- **WHEN** un subcomponente de configuración (información general, horarios, festivos, contraseñas, mensajes) reporta éxito o fallo
- **THEN** invoca directamente el método correspondiente de `toast` sin recibir `setToast` por props desde la página principal de Ajustes, mostrando el icono y color semánticos adecuados a la naturaleza del resultado.

#### Scenario: Feedback visible de guardado en el panel de Inicio
- **WHEN** el usuario registra una cita o cliente a través de los modales en la página de `/inicio`
- **THEN** el sistema muestra la notificación toast de confirmación correspondiente antes de refrescar los datos, eliminando los cierres silenciosos.
