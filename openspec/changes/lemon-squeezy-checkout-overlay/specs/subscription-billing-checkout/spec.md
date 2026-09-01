# subscription-billing-checkout Delta Specification

## MODIFIED Requirements

### Requirement: Modal de Checkout de Suscripción con Lemon Squeezy
El sistema SHALL reemplazar la ventana modal personalizada multi-paso por la integración directa con el Checkout Overlay nativo de Lemon Squeezy mediante enlaces con la clase `lemonsqueezy-button` que incluyan dinámicamente los parámetros de usuario (`checkout[custom][user_id]` y `checkout[email]`).

#### Scenario: Apertura del modal con plan preseleccionado
- **WHEN** un usuario autenticado activa la contratación o actualización de plan (desde el banner de trial, ajustes o avisos de límite)
- **THEN** el sistema activa el enlace con clase `lemonsqueezy-button` hacia la URL de checkout configurada para el plan con los datos del usuario precargados.

#### Scenario: Lanzamiento del checkout overlay de Lemon Squeezy
- **WHEN** el usuario hace clic en el botón/enlace `lemonsqueezy-button`
- **THEN** Lemon Squeezy JS intercepta el evento y despliega el overlay de pago seguro dentro de la aplicación sin abrir ventanas modales intermedias locales.
