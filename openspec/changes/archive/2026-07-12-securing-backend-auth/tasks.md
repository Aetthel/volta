## 1. Configuración de Entorno y Utilidades

- [x] 1.1 Documentar la nueva variable de entorno `BACKEND_JWT_SECRET` en `.env.example` y validar su existencia en el backend (`backend/src/config.js` o `backend/src/index.js`) fallando en el arranque si no está definida en entornos activos.
- [x] 1.2 Crear una utilidad criptográfica reutilizable (o código local) en el frontend y backend para firmar y verificar tokens (JWT) usando el módulo nativo `crypto` de Node.js.

## 2. Implementación en el Frontend Proxy

- [x] 2.1 Modificar el proxy de la API del frontend (`frontend/app/api/backend/[...path]/route.ts`) para firmar los datos del usuario (rol, businessId, email) en un JWT.
- [x] 2.2 Reemplazar el reenvío de cabeceras en texto plano `x-user-role` y `x-user-business-id` por el envío de la cabecera `Authorization: Bearer <JWT>`.

## 3. Implementación en el Backend (Autenticación y Autorización)

- [x] 3.1 Actualizar el middleware `authenticate` en `backend/src/middleware.js` para extraer y verificar el JWT firmado desde la cabecera `Authorization`, poblando la sesión `req.user` con los valores decodificados del token.
- [x] 3.2 Implementar el middleware `requireRole(allowedRoles)` en `backend/src/middleware.js`.
- [x] 3.3 Aplicar el middleware de control de acceso `requireRole(['ADMIN'])` en todas las rutas definidas dentro de `backend/src/routes/admin.js`.

## 4. Remediación del Semillado en Producción

- [x] 4.1 Envolver las sentencias de semillado (seeding) de las cuentas de prueba `admin@test.com`, `jefe@test.com` y `empleado@test.com` en `backend/src/dbInit.js` con el condicional de entorno `process.env.NODE_ENV !== 'production'`.
- [x] 4.2 Añadir soporte en `backend/src/dbInit.js` para leer `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` de forma que se pueda inicializar un administrador legítimo en entornos de producción de manera segura.

## 5. Asegurar URLs de Consentimiento LOPD (Prevención de IDOR)

- [x] 5.1 Actualizar `backend/src/bot.js` para incluir un token de verificación (firma HMAC del ID del cliente) en el enlace de consentimiento LOPD enviado a los clientes por WhatsApp.
- [x] 5.2 Modificar los endpoints de `backend/src/routes/lopd.js` para validar la firma HMAC (`token`) recibida en la petición antes de mostrar los detalles o aceptar la política LOPD del cliente.
