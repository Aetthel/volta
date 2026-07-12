## 1. Creación de Estructura y Nuevos Módulos

- [x] 1.1 Crear los subdirectorios `config/`, `middleware/`, `services/` y `utils/` bajo el directorio `backend/src/`.
- [x] 1.2 Crear el wrapper utilitario `asyncHandler.js` dentro de `backend/src/utils/asyncHandler.js` para capturar errores de promesas.
- [x] 1.3 Implementar el middleware global de errores `errorHandler.js` dentro de `backend/src/middleware/errorHandler.js`.

## 2. Migración y Organización Física de Archivos

- [x] 2.1 Mover y adaptar `config.js` ──▶ `config/index.js`, y mover `db.js` y `dbInit.js` a la carpeta `config/`, ajustando sus dependencias relativas.
- [x] 2.2 Descomponer el archivo `middleware.js` actual en `middleware/auth.js` (que exporta `authenticate` y `requireRole`) y `middleware/validation.js` (que contiene `isValidId`, `validateId` y `validateBody`).
- [x] 2.3 Mover y renombrar `utils.js` ──▶ `utils/formatters.js`, y mover `utils/crypto.js` bajo `utils/` si procede, asegurando que todos los imports apunten a los nuevos directorios.
- [x] 2.4 Reubicar `whatsapp.js` ──▶ `services/whatsappService.js` y `bot.js` ──▶ `services/botService.js`, actualizando las referencias en otros módulos.

## 3. Integración y Limpieza de Rutas

- [x] 3.1 Modificar `backend/src/index.js` para actualizar las importaciones y registrar el `errorHandler` global al final de toda la cadena de middleware de Express.
- [x] 3.2 Refactorizar los archivos de rutas de la carpeta `backend/src/routes/` para envolver sus endpoints asíncronos en `asyncHandler`, y eliminar todos los bloques redundantes `try/catch` de control HTTP.
