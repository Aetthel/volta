# Proposal: Acceso Verificado por Teléfono en la Reserva Pública

## Why

Hoy `/booking/:businessId` es una página completamente abierta: cualquiera con la URL ve el catálogo de servicios, los horarios libres y puede crear una cita escribiendo un nombre y un teléfono arbitrarios. Esto genera tres problemas reales para el negocio:

1. **Reservas falsas o suplantadas** que ocupan aforo y no se presentan, sin ninguna forma de contactar al que reservó.
2. **Ficha de cliente sucia**: cada teléfono mal escrito crea un `Client` duplicado, porque `Client.phone` no tiene restricción de unicidad por negocio (solo un índice `@@index([businessId, phone])`).
3. **Sin trazabilidad LOPD**: no existe prueba de que la persona que reservó sea la titular del teléfono con el que luego se le envían recordatorios de WhatsApp.

El teléfono es ya la clave funcional con la que el sistema reconoce a un cliente (`publicBookingController.createPublicBooking` busca por `businessId + phone`). Esta change lo convierte en una identidad **verificada** antes de dar acceso al flujo de reserva.

## What Changes

- **Puerta de identificación previa (paso 0)** en `/booking/:businessId`. Nadie ve servicios, horarios ni puede reservar sin superarla.
- **Reconocimiento por teléfono**: si el móvil introducido existe como `Client` de ese negocio, se envía un código OTP de 6 dígitos por el gateway de WhatsApp del propio negocio.
- **Alta de cliente no registrado**: si el teléfono no consta, el formulario pide además **nombre completo** y solo entonces envía el OTP. El `Client` **no** se crea en este punto; se crea al confirmar la reserva, como hasta ahora.
- **Sesión de reserva firmada** (`bookingToken`, HMAC-SHA256, caducidad 30 min) emitida al validar el OTP. El resto del flujo la exige.
- **BREAKING** `GET /api/public/booking/:businessId` deja de devolver `services` y `hours` sin token; se divide en un perfil público de marca y un payload completo autenticado.
- **BREAKING** `GET /api/public/booking/:businessId/available-slots` y `POST /api/public/booking/reserve` pasan a exigir `x-booking-token`. En `reserve`, el teléfono se toma **del token**, no del cuerpo de la petición.
- **BREAKING** `Client` gana `@@unique([businessId, phone])`, con migración de deduplicación de los registros existentes.
- **Restyling del asistente** manteniendo los mismos 4 pasos y exactamente la misma información (Servicio → Fecha y Hora → Mis Datos → Confirmación). El paso 3 pasa a mostrar el nombre y el teléfono ya verificados en lugar de pedirlos.
- **Retención de datos**: los registros de verificación se purgan a las 24 h.
- La reserva confirmada sigue guardándose directamente en la agenda del negocio (`Appointment` con `status: PENDING`), sin pasos manuales intermedios.

## Capabilities

### New Capabilities

- `public-booking-identity`: identificación y verificación por teléfono del cliente que accede al portal público de reservas, sesión de reserva resultante y acceso restringido al catálogo, la disponibilidad y la creación de la cita.

### Modified Capabilities

- `appointment-management`: el alta automática de `Client` durante la creación de una cita pasa a ser idempotente por `(businessId, phone)` en lugar de una simple búsqueda previa sin garantía de unicidad.

## Impact

**Backend**
- `backend/prisma/schema.prisma`: nuevo modelo `BookingVerification`; `@@unique([businessId, phone])` en `Client`. Dos migraciones (deduplicación + constraint).
- `backend/src/routes/publicBooking.js`, `backend/src/controllers/publicBookingController.js`: tres endpoints nuevos de identidad y protección de los tres existentes.
- Nuevo `backend/src/services/bookingIdentityService.js` y middleware `requireBookingSession`.
- Reutiliza `whatsappService.sendMessage` / `cleanPhoneForWhatsApp`, `utils/crypto.js` (`signToken`/`verifyToken`) y el sistema de alertas existente.
- Nueva variable de entorno `BOOKING_JWT_SECRET`.
- Nueva tarea `node-cron` de purga de verificaciones caducadas.

**Frontend**
- `frontend/app/booking/[businessId]/page.tsx` (568 líneas) se divide en `BookingIdentityGate`, `BookingWizard` y el hook `useBookingSession`.
- `frontend/app/api/backend/[...path]/route.ts`: reenvío de la cabecera `x-booking-token` en rutas `public`, siguiendo el patrón ya usado para `x-lopd-token`.

**Riesgo operativo**
- Un negocio con el gateway de WhatsApp desconectado no puede entregar OTP y su portal de reservas queda inoperativo hasta reconectarlo. Se cubre con mensaje explícito al cliente y alerta al negocio.
