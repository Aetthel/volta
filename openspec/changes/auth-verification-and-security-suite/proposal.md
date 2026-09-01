## Why

Actualmente el flujo de autenticación de Volta carece de mecanismos esenciales de verificación de identidad, recuperación de acceso y protección avanzada de cuentas. Los usuarios pueden registrarse con correos inexistentes o con errores tipográficos sin confirmación, no existe forma de recuperar una contraseña olvidada si el usuario la pierde, no se dispone de autenticación en dos pasos (2FA) para proteger datos sensibles de clientes y citas, y el cambio de contraseña autenticado no cuenta con una validación unificada y robusta.

Implementar esta suite de seguridad eleva la plataforma a estándares profesionales de producción, reduce el fraude y los accesos no autorizados, y asegura que tanto administradores como empleados puedan gestionar sus credenciales de manera autónoma y segura.

## What Changes

- **Verificación de Email por Código OTP (6 dígitos)**: Al registrarse, la cuenta se crea en estado pendiente de verificación y se envía un código numérico temporal (10 min) al email para activar el acceso antes de entrar al panel.
- **Flujo de Recuperación de Contraseña Olvidada (Forgot Password)**: Enlace en `/login` hacia `/forgot-password` para solicitar un enlace/token temporal firmado y de un solo uso por correo electrónico que permite restablecer la contraseña en `/reset-password`.
- **Autenticación en Dos Pasos (2FA / TOTP)**: Opción en ajustes de perfil para activar 2FA mediante aplicaciones autenticadoras estándar (Google Authenticator, Microsoft Authenticator, 1Password) con código QR, clave manual secreta y códigos de respaldo (backup codes).
- **Cambio de Contraseña Seguro desde el Perfil**: Formulario en `/ajustes` (pestaña Perfil) que exige la contraseña actual, valida la fortaleza de la nueva contraseña y actualiza el hash `bcrypt` en la base de datos.
- **Servicio Transaccional de Email**: Módulo en backend para el renderizado y envío de correos HTML con diseño corporativo Volta (OTP, enlace de reseteo, confirmaciones de seguridad).

## Capabilities

### New Capabilities
- `user-auth-security-suite`: Sistema integral de verificación de identidad por email (OTP), autenticación en dos factores (2FA / TOTP), recuperación de contraseñas olvidadas y cambio seguro de credenciales de usuario.

### Modified Capabilities
<!-- No modified capabilities requirements in existing specs -->

## Impact

- **Modelos de Base de Datos (Prisma)**: Campos en modelo `User` para `emailVerified`, `twoFactorEnabled`, `twoFactorSecret`, `twoFactorBackupCodes`, `otpCode`, `otpExpiresAt`, `resetPasswordToken`, `resetPasswordExpiresAt`.
- **Backend**: Nuevos endpoints y controladores en `backend/src/controllers/authSecurityController.js` y `backend/src/services/authSecurityService.js` para OTP, 2FA, Forgot Password y Password Change.
- **Frontend**: Páginas `/verify-email`, `/forgot-password`, `/reset-password`, intercepción de 2FA en `/login`, y sección de seguridad en `frontend/components/settings/ProfileSection.tsx`.
- **NextAuth**: Intercepción en callback de autenticación para comprobar `emailVerified` y desafío 2FA antes de emitir la sesión JWT.
