## Purpose

Define cómo un visitante del portal público de reservas demuestra ser el titular de un número de teléfono antes de poder ver el catálogo del negocio, consultar la disponibilidad y crear una cita, y cómo esa identidad verificada se vincula a la ficha de cliente y a la cita resultante.

## ADDED Requirements

### Requirement: Acceso Restringido al Portal de Reserva Pública

El portal público de reservas (`/booking/:businessId`) SHALL exigir una identidad de teléfono verificada antes de exponer el catálogo de servicios, los horarios disponibles o la creación de citas. Sin sesión de reserva válida, el sistema SHALL exponer únicamente los datos de marca del negocio necesarios para renderizar la pantalla de acceso: nombre, dirección, descripción, logo y color de tema.

#### Scenario: Visitante sin identificar abre la URL de reservas

- **WHEN** un visitante abre `/booking/:businessId` sin una sesión de reserva válida
- **THEN** el sistema muestra la pantalla de identificación con la marca del negocio y NO muestra la lista de servicios ni los horarios disponibles

#### Scenario: Consulta de disponibilidad sin sesión

- **WHEN** se solicita `GET /api/public/booking/:businessId/available-slots` sin cabecera `x-booking-token` o con un token inválido o caducado
- **THEN** el sistema responde `401` y no devuelve ningún horario

#### Scenario: Intento de reserva sin sesión

- **WHEN** se envía `POST /api/public/booking/reserve` sin una sesión de reserva válida
- **THEN** el sistema responde `401` y no crea ninguna cita ni ningún cliente

#### Scenario: Reservas públicas desactivadas en el negocio

- **WHEN** un visitante abre el portal de un negocio con `enablePublicBooking` desactivado o con suscripción `EXPIRED` o `CANCELLED`
- **THEN** el sistema muestra el aviso de reservas no disponibles y NO ofrece la pantalla de identificación

### Requirement: Identificación del Cliente por Número de Teléfono

El sistema SHALL identificar al visitante por su número de teléfono móvil, reducido a una forma canónica única antes de cualquier comparación o almacenamiento, de modo que dos escrituras distintas del mismo número se resuelvan siempre al mismo cliente. Si el teléfono normalizado corresponde a un `Client` existente del negocio, el sistema SHALL iniciar la verificación sin pedir más datos. Si no corresponde a ningún cliente del negocio, el sistema SHALL exigir además el nombre completo del visitante antes de iniciar la verificación.

El sistema SHALL crear el `Client` únicamente al confirmar la reserva; la identificación por sí sola NO SHALL crear ni modificar registros de cliente.

#### Scenario: Teléfono ya registrado como cliente del negocio

- **WHEN** el visitante introduce un teléfono que, normalizado, coincide con el de un `Client` de ese negocio
- **THEN** el sistema inicia la verificación por código y responde indicando que el teléfono está reconocido, sin revelar el nombre ni ningún otro dato del cliente

#### Scenario: Teléfono no registrado y sin nombre

- **WHEN** el visitante introduce un teléfono que no corresponde a ningún `Client` del negocio y no aporta nombre completo
- **THEN** el sistema responde solicitando el nombre completo y NO envía ningún código de verificación

#### Scenario: Teléfono no registrado con nombre completo

- **WHEN** el visitante introduce un teléfono no registrado junto con su nombre completo
- **THEN** el sistema inicia la verificación por código y conserva el nombre asociado a esa verificación hasta que caduque

#### Scenario: Normalización equivalente del teléfono

- **WHEN** el visitante introduce el mismo número escrito de formas distintas (por ejemplo `600112233`, `600 11 22 33` o `+34600112233`)
- **THEN** el sistema los trata como el mismo teléfono y reconoce al cliente existente en los tres casos

#### Scenario: Identificación abandonada

- **WHEN** un visitante se identifica y abandona el portal sin confirmar ninguna reserva
- **THEN** no aparece ningún `Client` nuevo en la ficha de clientes del negocio

### Requirement: Verificación por Código de un Solo Uso vía WhatsApp

El sistema SHALL verificar la titularidad del teléfono enviando un código numérico de 6 dígitos generado con un generador criptográficamente seguro, entregado por el gateway de WhatsApp del propio negocio. El código SHALL almacenarse cifrado de forma no reversible, SHALL caducar a los 5 minutos y SHALL ser de un solo uso.

#### Scenario: Envío del código

- **WHEN** se inicia una verificación válida
- **THEN** el sistema envía un mensaje de WhatsApp al teléfono indicado con un código de 6 dígitos y responde con el teléfono enmascarado y los segundos restantes de validez, sin incluir nunca el código en la respuesta HTTP

#### Scenario: Código correcto

- **WHEN** el visitante introduce el código vigente correspondiente a su verificación
- **THEN** el sistema marca la verificación como consumida y emite una sesión de reserva

#### Scenario: Código ya utilizado

- **WHEN** el visitante vuelve a enviar un código ya consumido
- **THEN** el sistema responde `400` con un error de código no válido y no emite ninguna sesión

#### Scenario: Código caducado

- **WHEN** el visitante introduce un código emitido hace más de 5 minutos
- **THEN** el sistema responde `400` indicando que el código ha caducado y ofrece solicitar uno nuevo

### Requirement: Límites de Intentos y Reenvíos de Verificación

El sistema SHALL limitar el abuso del canal de verificación. Un código SHALL admitir como máximo 5 intentos fallidos, tras los cuales queda invalidado. El sistema SHALL admitir como máximo 3 reenvíos por teléfono y negocio dentro de una ventana de 15 minutos, y SHALL aplicar además un límite por IP a los endpoints de identificación.

#### Scenario: Agotamiento de intentos

- **WHEN** el visitante falla el código 5 veces
- **THEN** el sistema invalida esa verificación y exige solicitar un código nuevo

#### Scenario: Exceso de reenvíos

- **WHEN** se solicita un cuarto código para el mismo teléfono y negocio dentro de 15 minutos
- **THEN** el sistema responde `429` indicando cuándo se podrá volver a solicitar

#### Scenario: Sondeo masivo de teléfonos desde una IP

- **WHEN** una misma IP supera el límite de solicitudes de identificación configurado
- **THEN** el sistema responde `429` y no revela si los teléfonos consultados pertenecen o no a clientes del negocio

### Requirement: Sesión de Reserva Firmada

Al superar la verificación, el sistema SHALL emitir un token de sesión de reserva firmado que acredite el negocio, el teléfono verificado y, si procede, el nombre aportado. El token SHALL caducar a los 30 minutos, SHALL ser válido únicamente para el negocio para el que se emitió y SHALL ser el único origen del teléfono usado al crear la cita.

#### Scenario: Contenido y alcance del token

- **WHEN** se emite una sesión de reserva
- **THEN** el token acredita `businessId` y el teléfono verificado, y el cliente puede consultar catálogo, disponibilidad y crear cita en ese negocio durante 30 minutos

#### Scenario: Token de otro negocio

- **WHEN** se presenta en `/booking/:businessId` un token emitido para un negocio distinto
- **THEN** el sistema responde `401` y devuelve al visitante a la pantalla de identificación

#### Scenario: Token caducado durante el flujo

- **WHEN** el token caduca mientras el visitante está en el asistente de reserva
- **THEN** el sistema devuelve al visitante a la pantalla de identificación conservando el servicio, la fecha y la hora ya elegidos

#### Scenario: Teléfono manipulado en la petición de reserva

- **WHEN** una petición de reserva incluye un `clientPhone` distinto al del token
- **THEN** el sistema ignora el valor del cuerpo y registra la cita con el teléfono verificado del token

### Requirement: Reserva Vinculada a la Identidad Verificada

La cita confirmada SHALL guardarse directamente en la agenda del negocio, sin aprobación manual intermedia, vinculada al `Client` correspondiente al teléfono verificado. Si ese cliente no existe todavía, el sistema SHALL crearlo en la misma transacción usando el nombre completo aportado durante la identificación.

#### Scenario: Reserva de un cliente ya registrado

- **WHEN** un cliente existente completa la reserva
- **THEN** el sistema crea una `Appointment` con estado `PENDING` vinculada a su `Client` existente, sin crear un cliente duplicado

#### Scenario: Reserva de un cliente nuevo

- **WHEN** un visitante cuyo teléfono no estaba registrado completa la reserva
- **THEN** el sistema crea el `Client` con el nombre aportado en la identificación y la `Appointment` asociada, ambos en la misma transacción

#### Scenario: Cita visible en la agenda del negocio

- **WHEN** una reserva pública se confirma correctamente
- **THEN** la cita aparece en la agenda del negocio en su fecha y hora, con el servicio, el nombre y el teléfono verificado del cliente

#### Scenario: Colisión de aforo durante la reserva

- **WHEN** el horario elegido alcanza el aforo del servicio antes de confirmar
- **THEN** el sistema responde `409`, no crea ninguna cita y el visitante conserva su sesión de reserva para elegir otro horario

### Requirement: Formato del Asistente de Reserva Verificado

El portal SHALL conservar el asistente de cuatro pasos (`1. Servicio`, `2. Fecha y Hora`, `3. Mis Datos`, `4. Confirmación`) y toda la información que ya muestra hoy: nombre, precio, duración, descripción y aforo de cada servicio; selector de fecha y horarios disponibles; resumen de la reserva; y recibo final de confirmación. El paso `3. Mis Datos` SHALL mostrar el nombre y el teléfono ya verificados en modo de solo lectura, y SHALL seguir permitiendo aportar un correo electrónico opcional.

#### Scenario: Datos de contacto ya verificados

- **WHEN** el visitante llega al paso `3. Mis Datos`
- **THEN** ve su nombre y teléfono verificados sin poder editarlos, y un campo opcional de correo electrónico

#### Scenario: Paridad de información con el portal anterior

- **WHEN** un visitante verificado recorre el asistente
- **THEN** dispone de la misma información de servicios, horarios, resumen y recibo que ofrecía el portal antes de esta change

### Requirement: Disponibilidad del Canal de Verificación

Si el gateway de WhatsApp del negocio no está conectado, el sistema SHALL informar al visitante de que la verificación no está disponible en ese momento y SHALL generar una alerta para el negocio, sin exponer detalles técnicos del gateway.

#### Scenario: Gateway desconectado

- **WHEN** un visitante solicita un código y el gateway de WhatsApp del negocio no está conectado
- **THEN** el sistema responde `503` con un mensaje comprensible para el visitante y registra una alerta para el negocio

### Requirement: Retención y Privacidad de los Datos de Verificación

Los datos de verificación (teléfono, nombre aportado, código cifrado, intentos e IP) SHALL conservarse solo el tiempo necesario para completar el proceso y auditar abusos, y SHALL eliminarse automáticamente a las 24 horas de su creación. La pantalla de identificación SHALL informar de la finalidad del tratamiento antes de solicitar el teléfono.

#### Scenario: Purga automática

- **WHEN** un registro de verificación cumple 24 horas
- **THEN** el sistema lo elimina, con independencia de si llegó a consumirse

#### Scenario: Aviso de privacidad en el acceso

- **WHEN** se muestra la pantalla de identificación
- **THEN** incluye un aviso sobre el uso del teléfono para verificar la identidad y gestionar la reserva
