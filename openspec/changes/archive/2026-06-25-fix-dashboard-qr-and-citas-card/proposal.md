## Why

El código QR en el dashboard (`/inicio`) aparece como una imagen rota porque se intenta enlazar directamente la cadena de texto cruda del código QR en lugar de generar una imagen de código QR. Adicionalmente, el diseño del encabezado de la tarjeta "Citas de Hoy" en el dashboard no se alinea con la consistencia visual y estética del resto de las tarjetas principales ("WhatsApp Bot" y "Servicios Solicitados").

## What Changes

- Corregir el enlace de la imagen del código QR en el componente de dashboard (`frontend/app/inicio/page.tsx`) para usar la API externa de generación de código QR (`https://api.qrserver.com/v1/create-qr-code/`), alineándolo con la implementación existente en la página de ajustes.
- Rediseñar el encabezado de la tarjeta "Citas de Hoy" en el dashboard para homogeneizarlo con las otras tarjetas:
  - Eliminar la fecha/día abajo (el subtítulo de la fecha actual).
  - Eliminar el badge/número de citas en total de la derecha.
  - Agregar un icono de calendario (`CalendarIcon`) al lado del título, con la misma clase de contenedor, color y espaciado que las tarjetas "WhatsApp Bot" y "Servicios Solicitados".

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `whatsapp-integration`: Corregir la renderización del código QR de sincronización de WhatsApp en la vista principal del dashboard.
- `reusable-ui-components`: Ajustar el estilo del encabezado de la tarjeta de citas de hoy en el dashboard para seguir la misma consistencia visual de las demás tarjetas de información.

## Impact

- `frontend/app/inicio/page.tsx`: Cambios visuales y estructurales en el dashboard principal.
