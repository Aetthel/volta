## Context

Actualmente, la comunicación entre el frontend (Next.js proxy) y el backend (Express) se realiza en texto plano para los metadatos del usuario (`x-user-role`, `x-user-business-id`). Esto presenta un riesgo de escalada de privilegios si el backend está expuesto a la red o si un cliente malintencionado obtiene la clave de API estática (`x-api-key`). Además, el backend Express no verifica internamente el rol de administrador en endpoints sensibles y se están creando credenciales de prueba por defecto de forma incondicional.

## Goals / Non-Goals

**Goals:**

- Implementar la firma criptográfica (HMAC-SHA256) de los datos de la sesión del usuario del frontend al backend sin introducir nuevas dependencias de terceros (usando el módulo nativo `crypto` de Node.js).
- Implementar controles de rol a nivel de ruta en el backend Express (`requireRole(['ADMIN'])`).
- Condicionar la creación de usuarios de prueba en `dbInit.js` al entorno de desarrollo (`process.env.NODE_ENV !== 'production'`).
- Encriptar o firmar la URL del consentimiento LOPD para evitar la aceptación no autorizada de políticas (IDOR).

**Non-Goals:**

- Reemplazar NextAuth en el frontend.
- Cambiar la comunicación general entre microservicios a HTTPS si no está configurada, sino centrarse en la autenticación lógica.

## Decisions

### Decisión 1: Firma de Tokens con Módulo Nativo `crypto` de Node.js

- **Alternativa:** Instalar la biblioteca `jsonwebtoken` en frontend y backend.
- **Razón:** El módulo `crypto` de Node.js es nativo, requiere cero dependencias adicionales y es seguro. Crearemos un token JWT simple firmado con HMAC-SHA256 y codificado en Base64 URL Safe.
- **Estructura del Token:** `Header (alg: HS256) + Payload (role, businessId, email, exp) + Firma HMAC-SHA256`.

### Decisión 2: Middleware de Autorización por Rol en el Backend

- **Alternativa:** Confiar únicamente en los filtros de ruta de Next.js.
- **Razón:** Defensa en profundidad. Si un atacante burla el proxy o accede directamente al backend, el backend Express debe validar por sí mismo que el usuario tiene el rol necesario. Crearemos el middleware `requireRole(allowedRoles)` en `backend/src/middleware.js`.

### Decisión 3: Semillado Seguro de Administrador en Producción

- **Alternativa:** Mantener cuentas de prueba fijas y pedir cambio de contraseña obligatoria.
- **Razón:** Inseguro en entornos públicos. La creación de usuarios por defecto en `dbInit.js` se envolverá en un bloque que compruebe que no estamos en producción. Si es producción y se requiere un admin inicial, se verificará la existencia de variables de entorno para inicializarlo de manera segura.

### Decisión 4: Enlaces LOPD Firmados

- **Alternativa:** Mantener solo UUIDs de clientes en las URLs.
- **Razón:** Los UUIDs protegen contra la enumeración simple, pero si el enlace se filtra o comparte, cualquiera puede aceptar los términos. Generaremos un token HMAC corto basado en la clave secreta y el ID del cliente para validar el enlace de consentimiento (`/api/lopd/:id/accept?token=...`).

## Risks / Trade-offs

- **[Riesgo]** Clave secreta no configurada en producción.
  - _Mitigación:_ Si la variable de entorno `BACKEND_JWT_SECRET` no está establecida en el backend, el servidor Express lanzará un error fatal en el arranque para evitar que funcione sin firma criptográfica.
