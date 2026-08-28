# Technical Design: Acceso Verificado por Teléfono en la Reserva Pública

## Context

Ver `proposal.md` — Why. Estado actual relevante:

- `frontend/app/booking/[businessId]/page.tsx` es un único componente cliente de 568 líneas con el asistente completo y tres `fetch` contra `/api/backend/public/booking/...`.
- `backend/src/routes/publicBooking.js` expone tres rutas sin ninguna autenticación; solo `POST /reserve` tiene `express-rate-limit` (10 req/15 min por IP en producción).
- `backend/src/controllers/publicBookingController.js` ya reconoce clientes por `businessId + phone` dentro de la transacción de reserva, pero sin unicidad garantizada en base de datos.
- Ya existen las piezas necesarias y no hay que añadir dependencias: `utils/crypto.js` (`signToken`/`verifyToken`, HMAC-SHA256 sobre JWT compacto), `whatsappService` (`sendMessage`, `cleanPhoneForWhatsApp`), `queues/whatsappQueue.js` (BullMQ), `cacheService` (Redis con degradación silenciosa a `null`) y `node-cron`.
- Conviven dos normalizaciones de teléfono incompatibles: `utils/formatters.js` → `normalizePhone` **quita** el prefijo `34` (forma nacional, `600112233`) y es la que ya escribe `appointmentsService` en `Client.phone`; `whatsappService.cleanPhoneForWhatsApp` **añade** el `34` (forma de marcado, `34600112233`). La reserva pública, por su parte, guarda hoy el teléfono tal cual lo teclea el visitante, así que los datos en producción están mezclados.
- El navegador nunca habla con el backend: todo pasa por el proxy `frontend/app/api/backend/[...path]/route.ts`, que solo reenvía cabeceras que conoce explícitamente (hoy `x-lopd-token` y `x-lopd-exp`).

## Goals / Non-Goals

**Goals:**

- Que el teléfono sea una identidad verificada y no un campo de texto libre, sin añadir dependencias nuevas al backend.
- Que la sesión de reserva sea sin estado en servidor (token firmado) para no depender de Redis en el camino crítico.
- Reutilizar el gateway de WhatsApp por negocio que ya se usa para recordatorios y LOPD.
- Migrar los datos existentes a `(businessId, phone)` único sin perder citas ni consentimientos LOPD.

**Non-Goals:**

- No se crea una cuenta ni una contraseña para el cliente final: la sesión dura 30 minutos y muere ahí.
- No se implementa área de cliente ("mis próximas citas", cancelación o reprogramación). Se deja como capacidad futura.
- No se añade SMS ni email como canal alternativo de OTP en esta change.
- No se rediseña la estructura del asistente: sigue siendo el mismo de cuatro pasos.

## Decisions

### 1. Almacenar la verificación en Postgres, no en Redis

Nuevo modelo Prisma:

```prisma
model BookingVerification {
  id          String    @id @default(uuid())
  businessId  String
  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  phone       String    // forma canónica de normalizePhone (sin prefijo 34)
  pendingName String?   // nombre aportado si el teléfono no era cliente
  codeHash    String    // HMAC-SHA256(code, BOOKING_JWT_SECRET)
  attempts    Int       @default(0)
  expiresAt   DateTime
  consumedAt  DateTime?
  ip          String?
  createdAt   DateTime  @default(now())

  @@index([businessId, phone])
  @@index([expiresAt])
}
```

**Por qué no Redis:** `cacheService` está diseñado para degradar en silencio (`get` devuelve `null` si Redis no responde). Aplicado a un OTP eso significa "código siempre inválido" sin señal de error, o peor, un bypass si el código de llamada interpreta el `null` como ausencia de comprobación. La verificación es el punto donde se decide un acceso: tiene que fallar de forma ruidosa y auditable. Postgres ya es dependencia dura del backend.

**Alternativa descartada:** OTP autofirmado en un token sin estado (código embebido en un JWT devuelto al cliente). Elimina la tabla, pero impide contar intentos y limitar reenvíos, que es justamente lo que evita el ataque por fuerza bruta sobre 6 dígitos.

### 2. Sesión de reserva con `signToken`, secreto propio

Token emitido con `signToken(payload, BOOKING_JWT_SECRET)` y verificado con `verifyToken`, reutilizando `utils/crypto.js`. Claims: `scope: "public-booking"`, `businessId`, `phone` (normalizado), `name` (solo si el cliente no estaba registrado), `iat`, `exp = iat + 1800`.

**Secreto separado de `BACKEND_JWT_SECRET`:** el token de sesión de dashboard acredita un usuario con rol; el de reserva acredita a un desconocido de internet. Compartir secreto significa que una fuga por cualquiera de los dos lados compromete el otro, y que un fallo en la validación de `scope` convierte un token público en credencial de backend. El middleware `requireBookingSession` SIEMPRE comprueba `scope === "public-booking"` y `businessId === req.params.businessId`.

**Transporte:** cabecera `x-booking-token`, no cookie. El proxy de Next ya tiene el patrón para `x-lopd-token`; hay que añadir el reenvío para `pathParts[0] === "public"`. En el navegador el token vive en `sessionStorage` (muere al cerrar la pestaña, no viaja a otras pestañas del mismo origen abiertas antes). No se usa cookie porque el portal se abre a menudo desde el navegador embebido de WhatsApp o Instagram, donde las cookies de terceros y la persistencia son poco fiables.

### 3. División del endpoint público del negocio

| Endpoint | Antes | Después |
|---|---|---|
| `GET /public/booking/:businessId/profile` | — | **Nuevo**, sin token: `name`, `address`, `description`, `logoUrl`, `coverUrl`, `themeColor`, `enablePublicBooking` |
| `GET /public/booking/:businessId` | público, todo | **Requiere token**: perfil + `hours` + `services` |
| `GET /public/booking/:businessId/available-slots` | público | **Requiere token** |
| `POST /public/booking/reserve` | público | **Requiere token**; `clientPhone` y `clientName` del cuerpo se ignoran |
| `POST /public/booking/:businessId/identity/start` | — | **Nuevo**: `{ phone, fullName? }` → `NAME_REQUIRED` \| `OTP_SENT` |
| `POST /public/booking/:businessId/identity/verify` | — | **Nuevo**: `{ phone, code }` → `{ bookingToken, expiresAt, displayName }` |
| `POST /public/booking/:businessId/identity/resend` | — | **Nuevo**, mismo límite que `start` |

El color de tema tiene que seguir siendo público porque la pantalla de identificación ya se pinta con la marca del negocio (`applyThemeColors` en el `useEffect` actual).

### 4. Fuga de existencia de cliente: aceptada y acotada

`identity/start` responde de forma distinta según el teléfono sea o no cliente del negocio (`OTP_SENT` frente a `NAME_REQUIRED`). Eso permite a un tercero comprobar si un número concreto es cliente de ese negocio — información sensible en negocios de salud o estética.

Es una consecuencia inevitable del flujo pedido: el visitante no registrado tiene que saber que debe aportar su nombre. Mitigaciones:

- La respuesta nunca incluye el nombre ni ningún otro dato del cliente reconocido.
- Límite por IP en los tres endpoints de identidad (más estricto que el actual de `reserve`) y límite de 3 códigos por teléfono/negocio cada 15 minutos.
- El titular del número recibe un WhatsApp cada vez que alguien intenta identificarse con él, por lo que el sondeo es ruidoso y detectable.

**Alternativa descartada:** pedir siempre el nombre completo y validarlo contra el registrado. Cierra la fuga, pero rompe a cualquier cliente cuyo nombre esté escrito de otra forma en la ficha del negocio ("Mª José" frente a "Maria Jose"), y convierte el nombre en un segundo factor adivinable.

### 5. Entrega del OTP en primer plano, no por cola

`enqueueWhatsAppMessage` está pensado para recordatorios diferidos con reintentos exponenciales de 5 s. Un OTP con TTL de 5 minutos necesita respuesta inmediata y, sobre todo, necesita que el visitante sepa al instante si el envío ha fallado. Se llama directamente a `whatsappManager.sendMessage` comprobando antes `whatsappManager.isReady(businessId)`.

`sendMessage` simula el envío fuera de producción (`{ simulated: true }`). En desarrollo el código se escribe además en el log con nivel `warn` para poder probar el flujo sin WhatsApp conectado; **nunca** en la respuesta HTTP y **nunca** si `NODE_ENV === "production"`.

### 6. Una única forma canónica de teléfono: la nacional

`Client.phone` se almacena siempre en la forma que devuelve `utils/formatters.normalizePhone` (dígitos sin prefijo `34`). No se introduce una tercera normalización ni se cambia la existente.

**Por qué la nacional y no la internacional:** es la que ya escribe `appointmentsService` desde el dashboard, que es la vía por la que entra la mayoría de los clientes. Cambiar el canon a la forma internacional obligaría a reescribir esa ruta y a reindexar todos los clientes existentes para no romper su búsqueda por teléfono, a cambio de nada.

`cleanPhoneForWhatsApp` no desaparece ni se fusiona: deja de ser una normalización rival para quedarse en lo que realmente es, la forma de **marcado** que necesita `chatId` al enviar el mensaje. Se aplica solo en el momento del envío, sobre el valor ya canónico.

La reserva pública deja de guardar el teléfono tal cual se teclea y pasa a canonizarlo como el resto del sistema — de ahí que hoy el mismo cliente pueda aparecer dos veces según reservase por la web o lo diese de alta el negocio.

### 7. Unicidad `(businessId, phone)` en dos migraciones

1. **Migración de datos**: canoniza `Client.phone` con `normalizePhone` y fusiona duplicados dentro de cada negocio — se conserva el `Client` más antiguo, se le reasignan `appointments` y `lopdConsentLogs`, se rellenan sus campos vacíos (`email`, `avatarUrl`, `frequentService`) desde los duplicados y se conserva el `lastVisit` más reciente y el `lopdStatus` **más restrictivo** (`Rechazado` > `Aceptado` > `Pendiente`), porque las negativas de consentimiento no se registran en `LopdConsentLog` y perder una en la fusión reactivaría un tratamiento que el cliente había rechazado. Se ejecuta como script idempotente con informe previo en seco (`--dry-run`).
2. **Migración de esquema**: `@@unique([businessId, phone])`.

Separarlas permite ejecutar y revisar la fusión en producción antes de aplicar la constraint, y hace que un fallo en la fusión no deje la migración de esquema a medias.

En `createPublicBooking`, la búsqueda + creación de `Client` pasa a `upsert` sobre la clave compuesta dentro de la transacción existente, lo que elimina la carrera actual entre dos reservas simultáneas del mismo teléfono nuevo.

### 8. Frontend: tres piezas en lugar de un componente

- `components/booking/BookingIdentityGate.tsx`: teléfono → (nombre si procede) → código, con reenvío, contador de caducidad y aviso de privacidad.
- `components/booking/BookingWizard.tsx`: los cuatro pasos actuales, restilizados, recibiendo la identidad ya verificada por props.
- `hooks/useBookingSession.ts`: token en `sessionStorage` bajo la clave `volta:booking:<businessId>`, expone `token`, `identity`, `isExpired` y un `authFetch` que al recibir un `401` limpia la sesión y devuelve el control al gate **sin perder** el servicio, la fecha y la hora ya elegidos (viven en el estado de `page.tsx`, por encima de ambos componentes).

## Risks / Trade-offs

- **[Gateway de WhatsApp caído deja el portal inoperativo]** → `identity/start` responde `503` con mensaje comprensible y crea una alerta para el negocio a través del sistema de alertas existente, de modo que el dueño se entera antes que por un cliente enfadado. Es el precio de elegir verificación real: se documenta como riesgo operativo asumido en la respuesta a la pregunta de diseño.
- **[Fricción añadida reduce la conversión de reservas]** → El gate son dos pantallas cortas y el cliente recurrente no teclea más que su móvil y 6 dígitos. Merece medir la tasa de abandono entre `identity/start` y `reserve` una vez desplegado.
- **[Fuerza bruta sobre 6 dígitos]** → 5 intentos por código y 3 códigos por teléfono cada 15 minutos dejan 15 intentos por ventana sobre un espacio de 10⁶: probabilidad despreciable. El límite por IP cubre el intento distribuido.
- **[Fusión de clientes duplicados es irreversible]** → El script se ejecuta primero en seco y genera un informe con los grupos a fusionar; se toma copia de seguridad antes de la ejecución real y el paso 1 se despliega separado del 2.
- **[`sessionStorage` no sobrevive al navegador embebido de WhatsApp al volver de una app externa]** → El impacto es tener que reintroducir el código; el estado del asistente se conserva en memoria mientras la pestaña viva.
- **[Un cliente cambia de número]** → Queda como cliente nuevo con el número nuevo y el negocio acaba con dos fichas de la misma persona. Fuera del alcance de esta change; la fusión manual de fichas desde el dashboard es candidata a change propia.

## Migration Plan

Backend y frontend salen de la misma imagen en `docker-compose.prod.yml` y despliegan a la vez, y el portal es el único consumidor de estos endpoints, así que no hace falta fase de compatibilidad: los endpoints se cierran en el mismo despliegue en que aparece el gate.

1. Definir `BOOKING_JWT_SECRET` en el entorno de producción. **El backend se niega a arrancar en producción sin ella**, para no emitir tokens firmados con el secreto por defecto.
2. Ejecutar `node scripts/dedupeClientPhones.js --dry-run` y revisar el informe. Si aparecen bloqueos (clientes sin teléfono utilizable en un mismo negocio), resolverlos a mano.
3. Copia de seguridad de la base de datos y ejecutar el script sin `--dry-run`.
4. Desplegar. `prisma migrate deploy` aplica la creación de `BookingVerification` y la constraint de unicidad; si quedasen duplicados, la migración aborta con un mensaje que nombra el script, sin dejar nada a medias.

**Rollback:** desplegar la imagen anterior. La constraint de unicidad y la fusión de clientes no se revierten: son una mejora de datos válida con o sin esta change.

## Open Questions

- ¿Debe el negocio poder desactivar la verificación desde sus ajustes (por ejemplo, mientras reconecta WhatsApp)? Es un `Boolean` en `Business` más una condición en `identity/start`; no cambia el contrato de los endpoints ni el reparto de tareas, así que puede decidirse después de ver el impacto real de las desconexiones.
- ¿30 minutos es la caducidad adecuada de la sesión de reserva? Es un parámetro, no una decisión estructural; se ajusta con los datos de abandono del primer mes.
