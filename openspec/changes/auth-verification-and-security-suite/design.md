## Context

Ver `proposal.md` para el contexto y la motivación. Actualmente Volta utiliza NextAuth v5 con proveedor de credenciales y Prisma (`User` y `Business`). El sistema carece de verificación de correo al registrarse, recuperación de contraseña por token temporal, soporte de 2FA basado en TOTP y endpoints seguros de cambio de clave.

## Goals / Non-Goals

**Goals:**
- Implementar un flujo robusto de verificación de cuenta por correo mediante código OTP de 6 dígitos con expiración de 10 minutos.
- Añadir recuperación de contraseña olvidada (`/forgot-password` y `/reset-password`) con tokens criptográficos de un solo uso (1 hora).
- Incorporar Autenticación en Dos Pasos (2FA) basada en RFC 6238 (TOTP) con generación de códigos QR (`otpauth://`), clave secreta y códigos de respaldo (backup codes).
- Proveer formulario de cambio seguro de contraseña en la pestaña de Perfil validando el hash actual y complejidad.
- Crear un servicio unificado de correo transaccional con plantillas HTML limpias y profesionales para Volta.

**Non-Goals:**
- No se implementa autenticación biométrica WebAuthn/Passkeys en esta fase (se mantiene estándar TOTP).
- No se envían códigos 2FA por SMS de pago (se utiliza TOTP gratuito en app móvil).

## Decisions

### 1. TOTP Estándar con `otplib` o criptografía nativa frente a SMS 2FA
- **Decisión**: Utilizar el estándar TOTP (RFC 6238) compatible con Google Authenticator, Authy y 1Password, generando códigos QR mediante `qrcode` en backend/frontend.
- **Razón**: Es el estándar más seguro, no tiene costes recurrentes por SMS y funciona sin cobertura móvil.

### 2. Tokens criptográficos firmados con HMAC / UUID con hash en BBDD
- **Decisión**: Para la recuperación de contraseña, almacenar el hash SHA-256 del token de reseteo en la base de datos con expiración estricta de 1 hora, enviando el token plano únicamente por correo electrónico.
- **Razón**: Si la base de datos se ve comprometida, los tokens de reseteo activos no pueden ser utilizados por un atacante.

### 3. Códigos OTP de 6 dígitos numéricos para verificación de email
- **Decisión**: Generar códigos de 6 dígitos (`crypto.randomInt(100000, 999999)`) asociados al usuario con expiración de 10 minutos y rate limiting (máximo 5 intentos antes de invalidar).
- **Razón**: Máxima facilidad de escritura para el usuario tanto en móvil como en escritorio.

### 4. Servicio Transaccional de Email con fallback a logger en entorno local
- **Decisión**: Implementar `emailService.js` con soporte para SMTP/Resend configurable por variables de entorno (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` o `RESEND_API_KEY`), con fallback a registro en log durante desarrollo local.
- **Razón**: Permite probar los flujos localmente sin requerir obligatoriamente credenciales SMTP de producción.

## Risks / Trade-offs

- **[Riesgo] Pérdida del dispositivo 2FA por parte del usuario** → **Mitigación**: Se generan y muestran 8 códigos de respaldo (backup codes) al activar 2FA para que el usuario los guarde en un lugar seguro.
- **[Riesgo] Ataques de fuerza bruta sobre códigos OTP** → **Mitigación**: Límite de 5 intentos por código y rate limiting estricto por IP y correo en los endpoints de verificación.
- **[Riesgo] Enumeración de correos en Forgot Password** → **Mitigación**: El endpoint responde con el mismo mensaje de éxito genérico independientemente de si el correo existe o no en el sistema.

## Migration Plan

1. Actualizar `schema.prisma` agregando campos de seguridad al modelo `User` y ejecutar `npx prisma db push` o migración.
2. Implementar `backend/src/services/emailService.js` con plantillas HTML para OTP, reseteo de clave y alertas de seguridad.
3. Crear `backend/src/services/authSecurityService.js` y `backend/src/controllers/authSecurityController.js` con los endpoints:
   - `POST /api/backend/auth/verify-otp`
   - `POST /api/backend/auth/resend-otp`
   - `POST /api/backend/auth/forgot-password`
   - `POST /api/backend/auth/reset-password`
   - `POST /api/backend/auth/2fa/setup`
   - `POST /api/backend/auth/2fa/verify-and-enable`
   - `POST /api/backend/auth/2fa/disable`
   - `POST /api/backend/auth/change-password`
4. Adaptar `frontend/auth.js` y `frontend/auth.config.ts` para verificar `emailVerified` y gestionar el desafío de 2FA.
5. Desarrollar las vistas frontend:
   - `frontend/app/(auth)/verify-email/page.tsx`
   - `frontend/app/(auth)/forgot-password/page.tsx`
   - `frontend/app/(auth)/reset-password/page.tsx`
   - Modal 2FA en `frontend/components/settings/ProfileSection.tsx` y formulario de cambio de clave.
