## Context

El proyecto Volta utiliza Next.js (App Router) en el `/frontend` y Express con Prisma en el `/backend`. Para la mensajería se utiliza `whatsapp-web.js` (Puppeteer de fondo). Actualmente, la clase `WhatsAppManager` en `backend/src/whatsapp.js` y el bot en `backend/src/bot.js` no están expuestos mediante endpoints REST, por lo que el usuario no tiene control sobre la conexión, el estado de emparejamiento (QR), la configuración de plantillas, ni el consentimiento de LOPD.

## Goals / Non-Goals

**Goals:**

- Exponer APIs REST seguras en el backend para emparejar y desconectar WhatsApp, consultar el estado/QR y actualizar las plantillas de mensajes.
- Implementar la lógica LOPD: registrar nuevos clientes como `Pendiente`, enviar un enlace de consentimiento por WhatsApp en lugar del mensaje de confirmación inicial, proveer una página pública responsiva de consentimiento y enviar la confirmación de cita retenida inmediatamente al aceptar.
- Modificar el Sentinel diario (`runSentinel`) y el disparador de bienvenida para ignorar a clientes en estado `Pendiente`.
- Crear la interfaz frontend de emparejamiento (mostrando el QR con polling) y de edición de plantillas en la sección de Ajustes del salón.

**Non-Goals:**

- Soporte para múltiples sesiones simultáneas de WhatsApp por salón (1 sesión única).
- Cola de mensajes persistente avanzada o webhooks de WhatsApp entrantes complejos (las respuestas del cliente no se procesarán).
- Configuración editable del texto legal de la política de privacidad desde el panel (se usará un texto estándar predefinido).

## Decisions

### 1. Mecanismo de Sincronización del Código QR (Polling vs WebSockets)

- **Decisión**: Se implementará un mecanismo de Polling HTTP en el frontend, consultando `/api/whatsapp/status` cada 5 segundos cuando el usuario esté emparejando el bot.
- **Razón**: Es extremadamente simple, robusto y fácil de depurar en entornos de proxy y contenedores en comparación con WebSockets o Server-Sent Events, y el volumen de uso no justifica la sobrecarga de mantener conexiones WebSocket activas en el servidor.
- **Alternativas**: WebSockets (descartado por complejidad innecesaria).

### 2. Inicialización de Sesiones de WhatsApp (On-Demand vs Startup)

- **Decisión**: Las sesiones de WhatsApp se inicializarán "On-Demand" (cuando el salón acceda a su panel, cuando se intente enviar un mensaje individual/bienvenida o cuando se ejecute el Sentinel diario). No se iniciarán todos de forma masiva en el arranque del servidor.
- **Razón**: Spawning múltiples procesos de Puppeteer concurrentemente en el arranque saturaría el CPU y RAM del servidor.
- **Alternativas**: Inicializar todos al arrancar el backend (descartado por alto consumo de recursos).

### 3. Envío de Mensaje de Consentimiento LOPD

- **Decisión**: Si se intenta enviar una confirmación de cita y el cliente está `Pendiente`, se reemplaza automáticamente por el mensaje de solicitud de consentimiento que contiene la URL única `http://localhost:3000/lopd/[clientId]`. Al pasar a `Aceptado`, se buscan citas futuras y se envía la confirmación.

## Risks / Trade-offs

- **[Riesgo] Bloqueo de cuentas por spam de WhatsApp**
  - _Mitigación_: Se implementa un retardo aleatorio de 2-5 segundos entre envíos en el Sentinel (`runSentinel`) para emular el comportamiento humano.
- **[Riesgo] Consumo excesivo de memoria por Puppeteer**
  - _Mitigación_: Destruir por completo la instancia de `Client` al recibir desconexión o error de autenticación, liberando los procesos de Chromium asociados.
