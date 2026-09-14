# Especificación de User Stories & Matriz de Testing QA — Volta

Este documento define el catálogo oficial de **User Stories con Criterios de Aceptación BDD (Given-When-Then)** y la **Matriz de Pruebas de Calidad (QA)** para certificar que todas las funciones de Volta operan de forma correcta, segura y resiliente.

---

## 1. Niveles de Prioridad de Pruebas

| Nivel | Clasificación | Criterio de Impacto |
|---|---|---|
| **P0** | **Bloqueante (Showstopper)** | La función principal queda inutilizada. Cierre de negocio: no se puede reservar, no se puede registrar o se pierden datos. |
| **P1** | **Crítico (Critical)** | Flujo principal degradado con impacto directo en ingresos o experiencia (ej. fallo en QR de WhatsApp, error al mover citas). |
| **P2** | **Mayor (Major)** | Funcionalidad secundaria con workaround disponible (ej. filtro de búsqueda impreciso, alerta no marcada como leída). |
| **P3** | **Menor / Visual (Minor)** | Desajuste estético, tipográfico o de animación sin afectación de datos. |

---

## 2. Módulos y User Stories Detalladas

---

### Módulo 1: Autenticación, Registro y Seguridad (Auth & Onboarding)

#### US-01: Registro de nuevo negocio en 4 pasos (Wizard)
- **Como** profesional o dueño de negocio (ej. peluquería, estética, clínica).
- **Quiero** registrar mi negocio y mi cuenta de administrador en un asistente guiado.
- **Para** comenzar a gestionar mis citas y configurar mi espacio de trabajo.

##### Criterios de Aceptación (BDD)
- **Escenario 1.1 (Happy Path - Registro completo):**
  - **Dado que** accedo a `/register` y selecciono el sector "Peluquería".
  - **Cuando** indico nombre comercial ("Estudio Volta"), teléfono comercial válido (`+34600111222`), datos de usuario (`admin@negocio.com`) y contraseña segura (`Pass1234!`).
  - **Entonces** se crea el registro del negocio en estado `TRIALING`, el usuario en estado `PENDING_VERIFICATION`, y se envía un código OTP al email redirigiendo a `/verify-email`.
- **Escenario 1.2 (Error - Teléfono o email duplicado) [P0]:**
  - **Dado que** introduzco un email que ya existe en la base de datos.
  - **Cuando** pulso en "Crear cuenta".
  - **Entonces** el sistema no avanza, muestra un mensaje descriptivo ("El correo ya está registrado") y no expone volcados de error ni stacks.
- **Escenario 1.3 (Validación Zod contraseñas no coincidentes) [P1]:**
  - **Dado que** en el paso 3 escribo dos contraseñas diferentes.
  - **Cuando** intento avanzar al siguiente paso.
  - **Entonces** el botón queda inhabilitado o muestra el error "Las contraseñas no coinciden".

---

#### US-02: Verificación de Correo (OTP) y Canje de Sesión
- **Como** usuario recién registrado.
- **Quiero** ingresar el código de 6 dígitos recibido por correo.
- **Para** verificar mi identidad y acceder al panel de control directamente sin volver a escribir la contraseña.

##### Criterios de Aceptación (BDD)
- **Escenario 2.1 (Happy Path - OTP correcto) [P0]:**
  - **Dado que** estoy en `/verify-email` con un código válido emitido hace menos de 15 minutos.
  - **Cuando** introduzco los 6 dígitos.
  - **Entonces** el sistema valida el código, marca `user.emailVerified = true`, `user.status = ACTIVE`, canjea el `verificationLoginToken` y me redirige a `/inicio`.
- **Escenario 2.2 (Límite de intentos y expiración) [P1]:**
  - **Dado que** un usuario introduce un código erróneo 5 veces consecutivas.
  - **Cuando** intenta el sexto intento.
  - **Entonces** el código queda invalidado por seguridad, se le solicita solicitar un nuevo reenvío y se activa el contador de espera (cooldown).

---

#### US-03: Control de Acceso Basado en Roles (RBAC: JEFE vs EMPLEADO)
- **Como** dueño del negocio (`JEFE`) o trabajador (`EMPLEADO`).
- **Quiero** tener permisos delimitados a mis responsabilidades.
- **Para** proteger la facturación, los ajustes globales y los datos sensibles del negocio.

##### Criterios de Aceptación (BDD)
- **Escenario 3.1 (Empleado intentando ver Ajustes/Facturación) [P1]:**
  - **Dado que** he iniciado sesión con rol `EMPLEADO`.
  - **Cuando** intento navegar a `/ajustes` o a los datos de facturación LemonSqueezy.
  - **Entonces** el sistema bloquea la vista, redirige a `/agenda` o `/inicio` y muestra alerta de permisos insuficientes.
- **Escenario 3.2 (Aislamiento Multi-Tenant) [P0]:**
  - **Dado que** el negocio A tiene el ID `uuid-a` y el negocio B tiene el ID `uuid-b`.
  - **Cuando** el usuario del negocio A realiza peticiones GET/POST a `/api/appointments` o `/api/clients`.
  - **Entonces** la base de datos sólo devuelve registros donde `businessId == uuid-a`. Bajo ninguna circunstancia se filtran datos del negocio B.

---

#### US-04: Autenticación de Doble Factor (2FA) y Recuperación de Contraseña
- **Como** administrador de Volta.
- **Quiero** activar la autenticación 2FA mediante TOTP (Google Authenticator / 1Password).
- **Para** blindar el acceso al panel contra accesos indebidos.

##### Criterios de Aceptación (BDD)
- **Escenario 4.1 (Activación y Backup Codes) [P1]:**
  - **Dado que** activo 2FA en `/ajustes` > Seguridad.
  - **Cuando** escaneo el código QR y verifico el primer código de 6 dígitos.
  - **Entonces** se muestran los 8 códigos de respaldo (backup codes) para descarga y el campo `twoFactorEnabled` pasa a `true`.
- **Escenario 4.2 (Login con 2FA) [P0]:**
  - **Dado que** tengo 2FA activo y hago login correcto con email y password.
  - **Cuando** el sistema pide el segundo factor.
  - **Entonces** no se expide la cookie de sesión final hasta que no se valide el token TOTP o un código de respaldo válido (el cual queda marcado como usado).

---

### Módulo 2: Configuración del Negocio y Recursos (Settings)

#### US-05: Horarios Comerciales y Franjas de Apertura/Cierre
- **Como** administrador de un centro.
- **Quiero** definir mis horarios semanales (lunes a domingo) con horas de apertura y cierre.
- **Para** que el motor de reservas públicas sólo ofrezca citas cuando el local está abierto.

##### Criterios de Aceptación (BDD)
- **Escenario 5.1 (Configuración de día cerrado) [P0]:**
  - **Dado que** marco el "Domingo" como cerrado (`isClosed = true`).
  - **Cuando** un cliente entra a la página pública de reserva (`/booking/[businessId]`).
  - **Entonces** todos los domingos aparecen deshabilitados en el selector de fecha del calendario.
- **Escenario 5.2 (Validación horario invertido) [P1]:**
  - **Dado que** un usuario intenta guardar apertura a las `18:00` y cierre a las `09:00` sin soporte de turno nocturno.
  - **Cuando** pulsa "Guardar horarios".
  - **Entonces** el formulario valida que `closeTime > openTime` y bloquea el guardado.

---

#### US-06: Excepciones de Festivos (Catálogo Nacional vs Autonómico)
- **Como** negocio con sede en una comunidad específica.
- **Quiero** activar qué festivos autonómicos celebro y si abro en algún festivo nacional.
- **Para** ajustar mi disponibilidad sin tener que bloquear manualmente las citas una por una.

##### Criterios de Aceptación (BDD)
- **Escenario 6.1 (Festivo nacional observado) [P1]:**
  - **Dado que** el día 25 de Diciembre es Navidad (Festivo Nacional) y no se ha marcado como excepción.
  - **Cuando** se consultan las fechas disponibles para reservar online.
  - **Entonces** el día 25 de Diciembre aparece marcado como cerrado sin huecos disponibles.
- **Escenario 6.2 (Apertura excepcional en festivo) [P2]:**
  - **Dado que** el negocio marca `isObserved = false` para un festivo nacional en `/ajustes`.
  - **Cuando** un cliente entra a reservar en esa fecha.
  - **Entonces** el sistema muestra los horarios habituales configurados para ese día de la semana.

---

#### US-07: Catálogo de Servicios (Individuales y Clases Grupales)
- **Como** negocio de servicios o centro de actividades (gimnasio, yoga, peluquería).
- **Quiero** dar de alta servicios con duración, precio, color identificador y tipo (individual o grupal).
- **Para** organizar mi oferta de citas y clases recurrentes.

##### Criterios de Aceptación (BDD)
- **Escenario 7.1 (Alta de servicio individual) [P0]:**
  - **Dado que** creo un servicio "Corte Degradado", 45 min, 22.50€, color azul.
  - **Cuando** guardo los cambios.
  - **Entonces** aparece disponible en la lista interna de citas y en el portal público de clientes.
- **Escenario 7.2 (Servicio Grupal con aforo) [P1]:**
  - **Dado que** configuro "Pilates Máquinas" como `GROUP` con aforo máximo de 6 plazas.
  - **Cuando** 6 clientes diferentes reservan para esa misma sesión.
  - **Entonces** la plaza número 7 queda bloqueada y el slot se muestra como "Aforo completo".

---

### Módulo 3: Motor de Disponibilidad y Reserva Pública (Booking Wizard)

#### US-08: Verificación Telefónica en Portal Público (`BookingIdentityGate`)
- **Como** cliente final que accede al enlace de reserva de un negocio.
- **Quiero** verificar mi número de teléfono con un código seguro de WhatsApp.
- **Para** asegurar que mis datos de contacto son reales y vincular mi historial de citas sin requerir crear una contraseña.

##### Criterios de Aceptación (BDD)
- **Escenario 8.1 (Verificación exitosa con código de 6 dígitos) [P0]:**
  - **Dado que** entro a `/booking/[businessId]`, introduzco mi número `600123456` y mi nombre.
  - **Cuando** recibo el código de 6 dígitos por WhatsApp y lo introduzco en los 6 campos.
  - **Entonces** el sistema valida el HMAC-SHA256 del código, consume el token (`consumedAt = now()`) e inicia la sesión del asistente de reserva.
- **Escenario 8.2 (Cooldown de reenvío y límite de intentos) [P1]:**
  - **Dado que** acabo de solicitar un código OTP.
  - **Cuando** intento pulsar "Reenviar código" inmediatamente.
  - **Entonces** el botón permanece bloqueado con un contador regresivo de 30 segundos (`RESEND_COOLDOWN_SECONDS`).
- **Escenario 8.3 (Tercer intento fallido de código) [P0]:**
  - **Dado que** un usuario introduce 3 códigos incorrectos.
  - **Cuando** falla el tercer intento (`attempts >= 3`).
  - **Entonces** la verificación se anula y el usuario debe solicitar un nuevo código tras un periodo de bloqueo por rate-limiting.

---

#### US-09: Cálculo Dinámico de Huecos Libres (Slots) y Prevención de Solapamiento
- **Como** cliente que está reservando cita.
- **Quiero** ver únicamente las horas que realmente están disponibles.
- **Para** evitar reservar a una hora donde el profesional ya está ocupado o el centro cerrado.

##### Criterios de Aceptación (BDD)
- **Escenario 9.1 (Exclusión de citas ocupadas) [P0]:**
  - **Dado que** existe una cita reservada de 10:00 a 11:00 para un servicio individual.
  - **Cuando** otro cliente consulta la disponibilidad para esa fecha y servicio (duración 30 min).
  - **Entonces** los slots de 10:00 y 10:30 no aparecen en la lista de opciones seleccionables.
- **Escenario 9.2 (Concurrencia extrema: doble reserva del mismo slot) [P0]:**
  - **Dado que** dos clientes (A y B) tienen abierta la pantalla a las 11:00 simultáneamente.
  - **Cuando** el cliente A pulsa confirmar primero y milisegundos después pulsa el cliente B.
  - **Entonces** la reserva de A se crea con éxito, la transacción de B detecta la colisión en base de datos, falla limpiamente y notifica a B: "Esta hora acaba de ser reservada. Por favor selecciona otro horario."

---

#### US-10: Consentimiento LOPD Obligatorio en Reserva Pública
- **Como** negocio sujeto a la legislación española de protección de datos (RGPD / LOPD-GDD).
- **Quiero** que el cliente acepte expresamente la política de privacidad antes de confirmar la cita.
- **Para** cumplir con la legalidad y almacenar la trazabilidad del consentimiento.

##### Criterios de Aceptación (BDD)
- **Escenario 10.1 (Registro del consentimiento con telemetría legal) [P0]:**
  - **Dado que** el cliente marca la casilla obligatoria de política de privacidad y pulsa "Confirmar reserva".
  - **Cuando** se crea la cita y el cliente.
  - **Entonces** se inserta un registro en la tabla `LopdConsentLog` que almacena: `clientId`, `businessId`, `ipAddress`, `userAgent`, `policyVersion` ("1.0") y `acceptedAt = now()`.
- **Escenario 10.2 (Bloqueo sin consentimiento) [P1]:**
  - **Dado que** el cliente completa todos los pasos pero desmarca la casilla LOPD.
  - **Cuando** intenta hacer clic en "Confirmar cita".
  - **Entonces** el botón está inhabilitado o resalta el error legal en color rojo de advertencia.

---

### Módulo 4: Agenda y Calendario del Panel de Control

#### US-11: Visualización y Navegación de Citas
- **Como** administrador o empleado.
- **Quiero** ver la agenda en vistas diaria y semanal con código de colores según el servicio.
- **Para** organizar el flujo de trabajo del día y atender a los clientes puntualmente.

##### Criterios de Aceptación (BDD)
- **Escenario 11.1 (Carga fluida de citas del día) [P0]:**
  - **Dado que** entro a `/agenda`.
  - **Cuando** selecciono la fecha de hoy.
  - **Entonces** se muestran todas las citas correspondientes a mi `businessId`, ordenadas cronológicamente con nombre del cliente, teléfono, servicio y estado.
- **Escenario 11.2 (Filtrado por estado o servicio) [P2]:**
  - **Dado que** tengo 20 citas en el día entre canceladas, pendientes y confirmadas.
  - **Cuando** filtro por "Pendientes".
  - **Entonces** la vista oculta las citas canceladas o finalizadas instantáneamente sin recargar la página completa.

---

#### US-12: Creación Manual y Edición de Citas
- **Como** recepcionista o empleado.
- **Quiero** añadir una cita telefónica o presencial directamente en el calendario.
- **Para** registrar clientes que no usan la web de reservas.

##### Criterios de Aceptación (BDD)
- **Escenario 12.1 (Creación rápida y alta de cliente automática) [P0]:**
  - **Dado que** hago clic en un hueco de las 16:00 en el calendario.
  - **Cuando** introduzco el teléfono `+34611223344`, nombre "Carlos Ruiz" y selecciono servicio.
  - **Entonces** la cita queda agendada, y si el teléfono no existía previamente en `Client`, se crea la ficha del cliente en el negocio con teléfono canónico normalizado.
- **Escenario 12.2 (Modificación de hora / Arrastrar cita) [P1]:**
  - **Dado que** una cita está a las 12:00 y la muevo a las 13:00.
  - **Cuando** confirmo el cambio.
  - **Entonces** se actualiza `appointmentDate` en backend y se refresca la tarjeta en pantalla sin saltos visuales.

---

#### US-13: Materialización Recurrente de Clases Grupales (`ClassSchedule`)
- **Como** centro con clases semanales fijas (ej. Martes y Jueves a las 19:00).
- **Quiero** programar una serie recurrente con límite temporal.
- **Para** que el calendario genere las sesiones automáticamente sin crearlas a mano cada semana.

##### Criterios de Aceptación (BDD)
- **Escenario 13.1 (Idempotencia de generación del horizonte) [P1]:**
  - **Dado que** se define una clase recurrente para los martes a las 19:00 durante los próximos 3 meses.
  - **Cuando** dos usuarios abren la agenda o dos peticiones del cron coinciden.
  - **Entonces** el índice único `@@unique([classScheduleId, appointmentDate])` impide duplicar sesiones en la base de datos.
- **Escenario 13.2 (Borrado de sesión individual no resucita) [P1]:**
  - **Dado que** cancelo la sesión concreta de un martes festivo.
  - **Cuando** el generador automático avanza la marca de agua `generatedUntil`.
  - **Entonces** la sesión borrada no vuelve a regenerarse erróneamente.

---

### Módulo 5: Directorio de Clientes y Gestión LOPD

#### US-14: Normalización Canónica y Búsqueda de Clientes
- **Como** recepcionista.
- **Quiero** buscar clientes por nombre, apellido o teléfono independientemente de si introduzco prefijo internacional o espacios.
- **Para** encontrar de inmediato la ficha del cliente sin duplicados.

##### Criterios de Aceptación (BDD)
- **Escenario 14.1 (Normalización de teléfono) [P0]:**
  - **Dado que** un cliente se registra con `+34 600-11-22-33` y otro con `600112233`.
  - **Cuando** se guardan en backend mediante `normalizePhone`.
  - **Entonces** ambos convergen a la forma canónica de 9 dígitos para España, respetando la restricción de unicidad `@@unique([businessId, phone])`.
- **Escenario 14.2 (Búsqueda fuzzy) [P2]:**
  - **Dado que** busco "Gonzales" con 's'.
  - **Cuando** en la base de datos existe "González" con 'z'.
  - **Entonces** el sistema devuelve al cliente en los resultados principales.

---

#### US-15: Portal de Firma de Consentimiento LOPD (`/lopd/[id]`)
- **Como** cliente que recibe un enlace de regularización legal.
- **Quiero** revisar los tratamientos de mis datos y aceptar digitalmente.
- **Para** dar cumplimiento a la ley y permitir que me envíen recordatorios de cita.

##### Criterios de Aceptación (BDD)
- **Escenario 15.1 (Aceptación de consentimiento) [P1]:**
  - **Dado que** el cliente accede a `/lopd/[id]` de su negocio.
  - **Cuando** pulsa "Acepto el tratamiento de mis datos personales".
  - **Entonces** su estado en la ficha de cliente pasa de "Pendiente" a "Aceptado" y se registra la traza de auditoría inmutable.

---

### Módulo 6: Integración WhatsApp y Automatización (Evolution API)

#### US-16: Vinculación de Instancia WhatsApp por Código QR
- **Como** dueño del negocio.
- **Quiero** escanear un código QR desde WhatsApp en mi móvil para conectar mi número a Volta.
- **Para** que la plataforma pueda enviar recordatorios y responder mensajes en mi nombre.

##### Criterios de Aceptación (BDD)
- **Escenario 16.1 (Generación y refresco de QR) [P0]:**
  - **Dado que** el estado de WhatsApp es `DISCONNECTED` y pulso "Conectar WhatsApp" en `/ajustes`.
  - **Cuando** Evolution API responde con el string base64 del QR.
  - **Entonces** la interfaz muestra el código QR dinámico y el estado cambia a `WAITING_QR`.
- **Escenario 16.2 (Conexión confirmada por WebSocket/Webhook) [P0]:**
  - **Dado que** escaneo el QR desde la app móvil de WhatsApp.
  - **Cuando** Evolution API notifica el evento `connection.update` con estado `open`.
  - **Entonces** el backend actualiza `whatsappStatus = CONNECTED`, desaparece el QR y se muestra el badge verde de "Conectado".

---

#### US-17: Cola de Mensajes y Recordatorios Automáticos
- **Como** sistema de gestión.
- **Quiero** programar recordatorios de cita 24 horas antes del horario fijado.
- **Para** reducir la tasa de no asistencia (*no-show*).

##### Criterios de Aceptación (BDD)
- **Escenario 17.1 (Encolado seguro en BullMQ) [P1]:**
  - **Dado que** el cron horario detecta citas que ocurren mañana a esta hora.
  - **Cuando** genera los recordatorios.
  - **Entonces** los trabajos se insertan en la cola Redis de BullMQ evitando saturar la API de WhatsApp, respetando límites de tasa (*rate limit*) para evitar bloqueos del número.
- **Escenario 17.2 (Reintento ante fallo temporal) [P1]:**
  - **Dado que** el teléfono del cliente está apagado o sin cobertura momentánea.
  - **Cuando** el envío falla.
  - **Entonces** BullMQ aplica política de reintento exponencial (hasta 3 intentos) antes de marcar el estado de la cita como `ERROR` y generar una alerta interna.

---

#### US-18: Clasificador Inteligente de Intenciones (Bot & Inbox)
- **Como** cliente que responde por WhatsApp pidiendo cambiar una cita o preguntando precios.
- **Quiero** recibir una respuesta automática contextual o que se notifique al negocio.
- **Para** resolver mi duda de inmediato sin esperar a que el dueño esté libre.

##### Criterios de Aceptación (BDD)
- **Escenario 18.1 (Clasificación de intención) [P1]:**
  - **Dado que** un cliente escribe "Hola, quiero cambiar mi cita del martes para el miércoles".
  - **Cuando** el webhook de Evolution API dispara el analizador (Groq Llama 3.3 / OpenAI).
  - **Entonces** la intención se categoriza como `RESCHEDULE_APPOINTMENT` y se genera una alerta tipo `EMERGENTE` en el panel para acción del operador.

---

### Módulo 7: Facturación, Planes y Suscripciones (LemonSqueezy)

#### US-19: Ciclo de Vida de Suscripción y Restricciones de Plan
- **Como** plataforma SaaS.
- **Quiero** gestionar periodos de prueba (`TRIALING`) y planes (`BASIC`, `PRO`, `ENTERPRISE`).
- **Para** asegurar la monetización del software y bloquear funciones avanzadas tras el vencimiento.

##### Criterios de Aceptación (BDD)
- **Escenario 19.1 (Prueba expirada) [P0]:**
  - **Dado que** la fecha `trialExpiresAt` ha pasado y el estado no es `ACTIVE`.
  - **Cuando** el usuario entra al panel.
  - **Entonces** se bloquea la creación de nuevas citas y se muestra un banner/modal persistente requiriendo la suscripción con pasarela LemonSqueezy.
- **Escenario 19.2 (Procesamiento de Webhook de LemonSqueezy) [P0]:**
  - **Dado que** LemonSqueezy envía un webhook `subscription_created` con firma HMAC válida.
  - **Cuando** el backend lo recibe en `/api/webhooks/lemonsqueezy`.
  - **Entonces** se actualiza `subscriptionStatus = ACTIVE`, se guarda el `lemonSqueezySubscriptionId` y se restablece el acceso sin intervención manual.
- **Escenario 19.3 (Rechazo de webhook sin firma válida) [P0]:**
  - **Dado que** un atacante intenta enviar un POST simulado a `/api/webhooks/lemonsqueezy`.
  - **Cuando** la firma en la cabecera `x-signature` no coincide con el secreto configurado.
  - **Entonces** el servidor rechaza la petición inmediatamente con código HTTP `401 Unauthorized`.

---

### Módulo 8: Centro de Alertas y Notificaciones

#### US-20: Recepción y Gestión de Alertas del Sistema
- **Como** usuario del panel.
- **Quiero** recibir notificaciones de citas nuevas, mensajes entrantes o desconexión de WhatsApp.
- **Para** atender las incidencias en tiempo real sin tener que refrescar la pantalla.

##### Criterios de Aceptación (BDD)
- **Escenario 20.1 (Marcado de alerta leída) [P2]:**
  - **Dado que** tengo 3 alertas pendientes con indicador rojo en la campana.
  - **Cuando** abro el panel de alertas y pulso en una de ellas o en "Marcar todo como leído".
  - **Entonces** `isRead` pasa a `true` y el contador de notificaciones disminuye inmediatamente.

---

## 3. Matriz de Cobertura y Trazabilidad QA

| Código | Módulo | Funcionalidad | Severidad | Automatización Recomendada | Estado Actual |
|---|---|---|---|---|---|
| **TC-01** | Auth | Registro wizard 4 pasos | P0 | Playwright E2E | Cubierto parcialmente (`register.spec.ts`) |
| **TC-02** | Auth | Verificación OTP & Canje Token | P0 | Vitest + Playwright | Requiere test E2E de canje |
| **TC-03** | Auth | RBAC: Bloqueo de Empleado a Ajustes | P1 | Vitest (API) + Playwright | Cubierto en unitarios |
| **TC-04** | Auth | 2FA TOTP & Códigos de respaldo | P1 | Vitest (Service test) | Cubierto (`twoFactor.test.js`) |
| **TC-05** | Settings | Horarios semanales y días cerrados | P0 | Vitest (BusinessHours) | Cubierto (`businessHours.test.ts`) |
| **TC-06** | Settings | Catálogo de festivos y excepciones | P1 | Vitest (Holidays) | Cubierto (`holidays.test.ts`) |
| **TC-07** | Booking | BookingIdentityGate OTP WhatsApp | P0 | Vitest + Playwright | Cubierto en componente (`BookingIdentityGate.test.tsx`) |
| **TC-08** | Booking | Cálculo dinámico de slots | P0 | Vitest | Cubierto (`publicBookingCache.test.js`) |
| **TC-09** | Booking | Concurrencia y anti-solapamiento | P0 | Vitest / Autocannon | Cubierto (`concurrencyTest.js`) |
| **TC-10** | Booking | Consentimiento LOPD registrado | P0 | Vitest (`lopdService.test.js`) | Cubierto en backend |
| **TC-11** | Agenda | Listado y filtros de citas | P0 | Playwright E2E | **Pendiente de automatizar en E2E** |
| **TC-12** | Agenda | Creación manual de cita | P0 | Playwright E2E | **Pendiente de automatizar en E2E** |
| **TC-13** | Agenda | Materialización idempotente de clases | P1 | Vitest (`classSchedulesMaterialization.test.js`) | Cubierto |
| **TC-14** | WhatsApp | Generación y refresco de QR | P0 | Vitest (Evolution Client mock) | Cubierto (`evolutionApiClient.test.ts`) |
| **TC-15** | WhatsApp | Encolado BullMQ y rate limit | P1 | Vitest (`whatsappQueue.test.ts`) | Cubierto |
| **TC-16** | Billing | Webhook LemonSqueezy con firma | P0 | Vitest (`lemonsqueezy.test.ts`) | Cubierto |

---

## 4. Checklist Rápido de Smoke Test (Manual de 15 minutos)

Ejecutar antes de cualquier pase a producción:

- [ ] **1. Landing & Registro:** Carga la landing, botón "Comenzar", visualización correcta del formulario en móvil y escritorio.
- [ ] **2. Login & Sesión:** Login con credenciales válidas, persistencia de sesión tras refrescar F5.
- [ ] **3. Ajustes:** Comprobar que los horarios del negocio se cargan y guardan sin error.
- [ ] **4. Portal de Reserva Pública:**
  - [ ] Abrir `/booking/[businessId]` en ventana de incógnito.
  - [ ] El teléfono solicita código OTP.
  - [ ] Al avanzar, los días cerrados aparecen deshabilitados en el calendario.
  - [ ] Seleccionar hora y completar reserva aceptando LOPD.
  - [ ] Pantalla de éxito visible.
- [ ] **5. Agenda:**
  - [ ] Volver al panel de administración.
  - [ ] La cita recién reservada aparece en el calendario en su hora exacta.
  - [ ] Abrir detalle de la cita y cambiar estado a "Completada" o "Cancelada".
- [ ] **6. WhatsApp Status:**
  - [ ] El indicador en el menú muestra el estado actual de la instancia (Conectado / Desconectado).
- [ ] **7. Logout:** Cierre de sesión y confirmación de que las rutas protegidas no son accesibles con el botón "Atrás" del navegador.
