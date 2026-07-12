## Why

Para lograr la excelencia total en la base de código del backend de Volta, requerimos estandarizar la arquitectura en todos sus endpoints, separar limpiamente los esquemas de validación Zod, estandarizar las respuestas JSON HTTP, implementar un logger estructurado para producción y dejar configurada una suite de tests automatizados (Jest/Supertest).

## What Changes

- **Refactorización Completa Router-Controller-Service**: Migrar el resto de las rutas del backend (`business`, `services`, `users`, `whatsapp`, `lopd`, `admin`) a este patrón.
- **Centralización de Esquemas Zod**: Crear `backend/src/validators/` y extraer todos los esquemas inline.
- **Estandarización de Respuestas de la API**: Crear un formateador de respuestas en `backend/src/utils/apiResponse.js`.
- **Logging Estructurado**: Configurar una utilidad de log estructurado en `backend/src/utils/logger.js`.
- **Suite de Pruebas**: Instalar y configurar `jest` y `supertest` con un test de prueba para validar endpoints del backend.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `project-modular-structure`: Refinar y robustecer la arquitectura física y lógica del backend de Volta.

## Impact

- **`backend/package.json`**: Añadir scripts de tests y dependencias de desarrollo (`jest`, `supertest`).
- **`backend/src/`**: Creación de las carpetas `validators/`, `controllers/`, y `services/` correspondientes.
