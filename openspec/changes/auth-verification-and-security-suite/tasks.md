## 1. Modelo de Datos y Servicio de Email Transaccional

- [x] 1.1 Extender el modelo `User` en `backend/prisma/schema.prisma` con campos para verificación OTP, 2FA y recuperación de clave, aplicando la migración/push y verificando que el cliente Prisma compila.
- [x] 1.2 Implementar `backend/src/services/emailService.js` con soporte para envío de plantillas HTML corporativas de Volta (código OTP, enlace de reseteo y avisos de seguridad) con fallback a log en desarrollo.

## 2. Lógica Backend de Seguridad y Endpoints

- [x] 2.1 Implementar `backend/src/services/authSecurityService.js` con funciones criptográficas para generación/validación de OTP (6 dígitos), TOTP (2FA), tokens de reseteo SHA-256 y hashing de contraseñas.
- [x] 2.2 Crear `backend/src/controllers/authSecurityController.js` y registrar las rutas en `backend/src/routes/authSecurity.js` para los endpoints de verificación OTP, reenvío, solicitud de reseteo, confirmación de nueva contraseña, configuración 2FA y cambio de contraseña.

## 3. Integración con NextAuth y Flujo de Autenticación

- [x] 3.1 Actualizar `frontend/auth.js` y `frontend/auth.config.ts` para validar `emailVerified` y el desafío 2FA durante el inicio de sesión antes de emitir la sesión JWT.
- [x] 3.2 Adaptar `frontend/lib/apiClient.ts` con el espacio de nombres `auth` para consumir todos los nuevos endpoints de seguridad de forma tipada.

## 4. Interfaces de Usuario en Frontend

- [x] 4.1 Crear la página de verificación de correo `frontend/app/(auth)/verify-email/page.tsx` con input de 6 dígitos, cuenta atrás para reenvío y redirección automática.
- [x] 4.2 Crear las páginas de recuperación de contraseña `frontend/app/(auth)/forgot-password/page.tsx` y `frontend/app/(auth)/reset-password/page.tsx` con validaciones de fortaleza de clave.
- [x] 4.3 Añadir la sección de seguridad en `frontend/components/settings/ProfileSection.tsx` con el formulario de cambio de contraseña actual/nueva y el modal de activación/desactivación de 2FA con código QR y códigos de respaldo.

## 5. Pruebas y Validación Estricta

- [x] 5.1 Crear pruebas unitarias y de integración para la lógica criptográfica de OTP, 2FA y reseteo de contraseñas, verificando que pasan al 100%.
- [x] 5.2 Validar la especificación completa con `openspec validate auth-verification-and-security-suite --strict` y comprobar que todos los artefactos están listos.
