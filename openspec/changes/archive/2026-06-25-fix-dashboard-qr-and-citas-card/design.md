## Context

Actualmente, el código QR de WhatsApp en el dashboard (`/inicio`) se muestra intentando pasar directamente el string de emparejamiento como `src` de un elemento `<img>`, resultando en una imagen rota. La página de ajustes (`/ajustes`) ya cuenta con una solución funcional usando un servicio externo de generación de códigos QR (`https://api.qrserver.com/v1/create-qr-code/`).

Además, la cabecera de la tarjeta "Citas de Hoy" en el dashboard incluye una fecha de subtítulo y un badge con el total de citas, rompiendo la simetría y el estándar estético de las tarjetas de información adyacentes ("WhatsApp Bot" y "Servicios Solicitados").

## Goals / Non-Goals

**Goals:**

- Mostrar correctamente el código QR de sincronización en el dashboard principal cuando el estado sea `WAITING_QR`.
- Unificar el diseño del encabezado de la tarjeta "Citas de Hoy" con el estilo de las tarjetas "WhatsApp Bot" y "Servicios Solicitados".

**Non-Goals:**

- Cambiar la base de datos o el backend para retornar formatos de imagen en lugar de texto para el QR.
- Alterar el diseño de otras páginas o tarjetas de métricas en el grid superior.

## Decisions

### 1. Renderizado de código QR en Dashboard

- **Decisión**: Usar la API de `api.qrserver.com` para generar la imagen del código QR a partir del texto `qrCode` directamente en el `src` del elemento `<img>` en `frontend/app/inicio/page.tsx`.
- **Alternativa considerada**: Instalar una biblioteca de react-qr en el frontend. Se descarta para evitar pesos extra en el bundle y porque ya se usa `api.qrserver.com` en ajustes.
- **Razón**: Consistencia total con el módulo de ajustes y facilidad de implementación.

### 2. Estandarización de cabecera de "Citas de Hoy"

- **Decisión**: Reemplazar la cabecera flex actual que contiene un flex-col (título y subtítulo fecha) y un badge, por un layout simple que integre `CalendarIcon` junto con el título en un `flex items-center gap-2`.
- **Razón**: Consistencia visual exacta con los headers de "WhatsApp Bot" y "Servicios Solicitados".

## Risks / Trade-offs

- **[Dependencia de API externa]** $\rightarrow$ Si `api.qrserver.com` no responde, no se mostrará el QR. Se mitiga ya que es la misma dependencia que usa `/ajustes`, y el emparejamiento es un proceso puntual de un único uso.
