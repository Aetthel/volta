## Purpose

Proporciona una suite completa de seguridad y gestión de credenciales para usuarios de Volta, incluyendo verificación de correo electrónico mediante código OTP de 6 dígitos, autenticación de doble factor (2FA/TOTP), cambio autenticado de contraseña y recuperación de contraseña olvidada con tokens seguros.

## ADDED Requirements

### Requirement: Email Verification via 6-Digit OTP Code
El sistema SHALL exigir la verificación del correo electrónico de cada usuario recién registrado mediante un código numérico OTP de 6 dígitos con expiración de 10 minutos antes de permitir el acceso completo a las funciones del panel.

#### Scenario: Usuario verifica su cuenta con código OTP correcto
- **WHEN** el usuario introduce el código OTP de 6 dígitos recibido en su correo electrónico
- **THEN** el sistema marca la cuenta como verificada, activa la sesión y redirige al panel de inicio

#### Scenario: Usuario introduce código OTP incorrecto o expirado
- **WHEN** el usuario introduce un código inválido o superados los 10 minutos
- **THEN** el sistema rechaza la activación, muestra un mensaje de error y ofrece la opción de reenviar un nuevo código

### Requirement: Two-Factor Authentication (2FA/TOTP)
El sistema SHALL permitir a los usuarios activar y verificar la autenticación en dos pasos (2FA) basada en algoritmos TOTP estándar compatibles con aplicaciones de autenticación móvil, proporcionando códigos QR, clave secreta y códigos de respaldo de un solo uso.

#### Scenario: Inicio de sesión con 2FA activo
- **WHEN** un usuario con 2FA habilitado introduce correctamente su correo y contraseña
- **THEN** el sistema solicita el código TOTP de 6 dígitos o un código de respaldo antes de emitir el token de sesión JWT

#### Scenario: Vinculación inicial de 2FA en ajustes
- **WHEN** el usuario activa 2FA desde la configuración de su perfil
- **THEN** el sistema genera un código QR y solicita confirmar un código TOTP válido antes de guardar la clave secreta y activar la protección

### Requirement: Authenticated Password Change
El sistema SHALL permitir a los usuarios autenticados actualizar su contraseña desde su perfil, exigiendo la verificación previa de su contraseña actual y validando la complejidad de la nueva clave.

#### Scenario: Cambio exitoso de contraseña
- **WHEN** el usuario introduce su contraseña actual correcta y una nueva contraseña válida que cumple los requisitos de seguridad
- **THEN** el sistema actualiza el hash en la base de datos y emite una confirmación de guardado

#### Scenario: Intento de cambio con contraseña actual incorrecta
- **WHEN** el usuario introduce una contraseña actual que no coincide con el hash almacenado
- **THEN** el sistema rechaza la operación con un mensaje de error sin modificar las credenciales

### Requirement: Password Recovery via Reset Token
El sistema SHALL proporcionar un flujo seguro de restablecimiento de contraseña para usuarios que hayan olvidado sus credenciales, generando un token temporal firmado de un solo uso con validez máxima de 1 hora enviado por correo electrónico.

#### Scenario: Solicitud de restablecimiento de contraseña
- **WHEN** un usuario introduce su correo electrónico en la pantalla de recuperación
- **THEN** el sistema envía un email con un enlace seguro firmado a `/reset-password?token=...` protegiendo contra la enumeración de cuentas

#### Scenario: Restablecimiento con token válido
- **WHEN** el usuario accede al enlace y define una nueva contraseña válida
- **THEN** el sistema actualiza la contraseña, invalida el token utilizado y permite el inicio de sesión con las nuevas credenciales
