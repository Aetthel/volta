## Why

El backend actual confía de forma implícita en cabeceras HTTP suministradas directamente por el cliente (`x-user-role` y `x-user-business-id`) para establecer el rol y el negocio (`businessId`) del usuario, lo que permite la escalación de privilegios y la suplantación de identidad si un atacante posee la clave de API. Además, se están semillando credenciales de prueba por defecto en entornos de producción, y los endpoints administrativos carecen de controles de rol en el backend, lo que compromete la seguridad y el aislamiento multi-inquilino de la plataforma.

## What Changes

- **Firmado Criptográfico de Cabeceras / JWT**: Reemplazar la confianza implícita en cabeceras de texto plano por un esquema de tokens criptográficamente firmados (JWT) transmitidos entre el frontend proxy (Next.js) y el backend.
- **Validación de Roles en el Backend**: Implementar un middleware robusto de autorización por roles en el backend Express y aplicarlo en todas las rutas del panel administrativo para evitar el acceso de usuarios con pocos privilegios.
- **Protección del Semillado en Producción**: Modificar el script de inicialización de base de datos para impedir la creación de credenciales por defecto en producción, utilizando variables de entorno para la configuración segura del administrador inicial.
- **Seguridad en Consentimiento LOPD**: Diseñar una validación adicional para el flujo de consentimiento LOPD (por ejemplo, tokens temporales o verificación de procedencia) a fin de prevenir ataques IDOR.

## Capabilities

### New Capabilities

- Ninguna. Este cambio se centra exclusivamente en corregir y robustecer la seguridad de capacidades existentes.

### Modified Capabilities

- `web-authentication`: Robustecer la verificación de la identidad del usuario y los roles mediante la introducción de firmas criptográficas (JWT) en la comunicación proxy-backend y la validación estricta de roles en endpoints protegidos.
- `multitenant-core`: Asegurar el aislamiento multi-inquilino en el backend extrayendo el `businessId` verificado a partir de un token firmado criptográficamente, en lugar de confiar en cabeceras HTTP del cliente no validadas.

## Impact

- **Backend (`backend/src/`)**:
  - `middleware.js`: Modificación del middleware `authenticate` para validar y descodificar JWTs firmados, y creación del nuevo middleware de autorización por rol (`requireRole`).
  - `routes/admin.js`: Incorporación del middleware de validación de rol `ADMIN` en todas las rutas.
  - `dbInit.js`: Restricción del semillado de cuentas por defecto solo a entornos que no sean de producción, y soporte de variables de entorno para el administrador en producción.
- **Frontend Proxy (`frontend/app/api/backend/[...path]/route.ts`)**:
  - Firma criptográfica del payload del usuario en cada petición proxy hacia el backend mediante una clave secreta compartida (`BACKEND_JWT_SECRET`).
