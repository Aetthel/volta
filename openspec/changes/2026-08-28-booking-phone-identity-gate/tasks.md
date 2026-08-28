# Tasks: Acceso Verificado por Teléfono en la Reserva Pública

## 1. Modelo de datos y migraciones

- [x] 1.1 Añadir el modelo `BookingVerification` a `backend/prisma/schema.prisma` con los índices `[businessId, phone]` y `[expiresAt]`, y su relación con `Business`
- [x] 1.2 Fijar `utils/formatters.normalizePhone` como única forma canónica de `Client.phone`: cubrirla con tests, y hacer que `whatsappService.sendMessage` aplique `cleanPhoneForWhatsApp` sobre el valor ya canónico en lugar de competir con él
- [x] 1.3 Escribir `backend/scripts/dedupeClientPhones.js`: normaliza `Client.phone`, agrupa por `(businessId, phone)`, conserva el cliente más antiguo, reasigna `appointments` y `lopdConsentLogs`, consolida campos vacíos, `lastVisit` más reciente y `lopdStatus` más restrictivo. Soporta `--dry-run` con informe de grupos afectados
- [x] 1.4 Crear la migración de esquema con `@@unique([businessId, phone])` en `Client`
- [x] 1.5 Test de integración del script de deduplicación sobre un conjunto de clientes duplicados con citas y consentimientos asociados

## 2. Servicio de identidad de reserva

- [x] 2.1 Añadir `BOOKING_JWT_SECRET` a `backend/src/config/index.js`, `.env.example` y a los `docker-compose*.yml` que definan variables del backend
- [x] 2.2 Crear `backend/src/services/bookingIdentityService.js`: generación del código con `crypto.randomInt`, `codeHash` mediante `computeHmac`, creación y consumo de `BookingVerification`, control de `attempts` (máx. 5) y de reenvíos (máx. 3 / 15 min)
- [x] 2.3 Implementar en el servicio el envío del código con `whatsappManager.isReady` + `sendMessage`, el `503` con alerta al negocio cuando el gateway no está conectado, y el volcado del código al log solo fuera de producción
- [x] 2.4 Implementar la emisión del `bookingToken` (`signToken`, claims `scope`/`businessId`/`phone`/`name`, `exp` a 30 min)
- [x] 2.5 Crear el middleware `requireBookingSession` en `backend/src/middleware/bookingSession.js`: lee `x-booking-token`, verifica firma, `scope === "public-booking"`, caducidad y coincidencia de `businessId`; deja la identidad en `req.bookingIdentity`
- [x] 2.6 Tests unitarios del servicio: código correcto, código caducado, código ya consumido, agotamiento de intentos y exceso de reenvíos

## 3. Endpoints públicos

- [x] 3.1 Añadir los esquemas Zod de identidad a `backend/src/validators/` (`identityStartSchema`, `identityVerifySchema`) y ajustar `publicBookingSchema` para que `clientPhone`/`clientName` dejen de ser obligatorios en el cuerpo
- [x] 3.2 Implementar `getPublicBusinessProfile` (sin token, solo datos de marca) en `publicBookingController.js` y exponerlo en `GET /:businessId/profile`
- [x] 3.3 Implementar `startIdentity`, `verifyIdentity` y `resendIdentityCode` en el controlador, devolviendo `NAME_REQUIRED` / `OTP_SENT`, teléfono enmascarado y segundos de validez
- [x] 3.4 Registrar las tres rutas de identidad en `backend/src/routes/publicBooking.js` con su propio `express-rate-limit` por IP
- [x] 3.5 Proteger `GET /:businessId`, `GET /:businessId/available-slots` y `POST /reserve` con `requireBookingSession`
- [x] 3.6 Modificar `createPublicBooking` para tomar teléfono y nombre de `req.bookingIdentity` ignorando los del cuerpo, y sustituir la búsqueda + creación de `Client` por un `upsert` sobre `(businessId, phone)` dentro de la transacción existente
- [x] 3.7 Añadir la tarea `node-cron` diaria que purga las `BookingVerification` de más de 24 horas
- [x] 3.8 Tests de API (`supertest`): acceso sin token a los tres endpoints protegidos, token de otro negocio, token caducado, reserva con `clientPhone` manipulado en el cuerpo y colisión de aforo conservando la sesión

## 4. Proxy y sesión en el frontend

- [x] 4.1 Reenviar la cabecera `x-booking-token` para rutas `public` en `frontend/app/api/backend/[...path]/route.ts`, siguiendo el patrón de `x-lopd-token`
- [x] 4.2 Crear `frontend/hooks/useBookingSession.ts`: token en `sessionStorage` bajo `volta:booking:<businessId>`, expone `token`, `identity`, `isExpired` y `authFetch` que limpia la sesión ante un `401`
- [x] 4.3 Test del hook: persistencia entre montajes, caducidad y limpieza tras `401`

## 5. Pantalla de identificación

- [x] 5.1 Crear `frontend/components/booking/BookingIdentityGate.tsx` con las subfases teléfono → nombre (solo si `NAME_REQUIRED`) → código
- [x] 5.2 Implementar el campo de código de 6 dígitos con pegado, avance automático y contador de caducidad visible
- [x] 5.3 Implementar el reenvío con cuenta atrás y el mensaje de límite alcanzado (`429`)
- [x] 5.4 Implementar los estados de error: código incorrecto con intentos restantes, código caducado, y verificación no disponible (`503`)
- [x] 5.5 Añadir el aviso de privacidad sobre el uso del teléfono antes del campo de entrada
- [x] 5.6 Pintar la marca del negocio en el gate a partir de `GET /:businessId/profile` (incluido `applyThemeColors`)

## 6. Asistente de reserva restilizado

- [x] 6.1 Extraer el asistente actual de `frontend/app/booking/[businessId]/page.tsx` a `frontend/components/booking/BookingWizard.tsx`, dejando en `page.tsx` la orquestación gate/asistente y el estado de servicio, fecha y hora
- [x] 6.2 Restilizar los cuatro pasos manteniendo el mismo indicador de progreso y exactamente la misma información de servicios, horarios, resumen y recibo
- [x] 6.3 Convertir el paso `3. Mis Datos` en resumen de identidad verificada: nombre y teléfono en solo lectura, correo electrónico opcional editable
- [x] 6.4 Enrutar las llamadas de catálogo, disponibilidad y reserva a través de `authFetch`, y devolver al gate conservando servicio, fecha y hora cuando la sesión caduque a mitad del flujo
- [x] 6.5 Test de componente del asistente: identidad en solo lectura, envío de reserva sin teléfono en el cuerpo y recuperación tras caducidad de sesión

## 7. Validación

- [x] 7.1 `openspec validate 2026-08-28-booking-phone-identity-gate --strict`
- [x] 7.2 Suite de backend (`jest`) y de frontend (`vitest`) en verde
- [x] 7.3 Build de producción de Next.js sin errores de tipos
- [ ] 7.4 Prueba manual del recorrido completo en `/booking/:businessId` con un teléfono ya registrado y con uno nuevo, verificando que la cita aparece en la agenda del negocio
