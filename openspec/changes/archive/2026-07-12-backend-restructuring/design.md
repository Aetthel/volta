## Context

El backend actual está estructurado en una lista plana de archivos dentro de `backend/src/`. Para mejorar la legibilidad y escalabilidad, necesitamos migrar hacia una organización modular limpia, e incorporar un manejador de errores global junto a `asyncHandler` para limpiar los controladores de rutas asíncronos.

## Goals / Non-Goals

**Goals:**
- Reorganizar el directorio `backend/src/` en subcarpetas lógicas: `config/`, `middleware/`, `routes/`, `services/`, `utils/`.
- Crear el middleware de errores centralizado `errorHandler.js` y el wrapper `asyncHandler.js`.
- Actualizar todas las importaciones y referencias de archivos internas del backend.
- Eliminar de forma progresiva los bloques redundantes `try/catch` de los archivos en `backend/src/routes/`.

**Non-Goals:**
- Reescribir la base de datos o modificar los esquemas de Prisma.
- Cambiar la lógica o API de los controladores en esta fase (solo se reorganizan físicamente).

## Decisions

### Decisión 1: Estructura de Directorios Específica
Se implementará la siguiente separación de responsabilidades física:
- **`config/`**: Contendrá `index.js` (antes `config.js`), `db.js` y `dbInit.js`.
- **`middleware/`**: Contendrá `auth.js` (extracción de JWT y roles), `validation.js` (validaciones de cuerpo y parámetros Zod) y `errorHandler.js`.
- **`services/`**: Contendrá `whatsappService.js` (antes `whatsapp.js`) y `botService.js` (antes `bot.js`).
- **`utils/`**: Contendrá `crypto.js`, `asyncHandler.js` y `formatters.js` (antes `utils.js`).
- **`routes/`**: Mantendrá los enrutadores de Express, actualizando sus imports.

### Decisión 2: Remediación de try/catch con `asyncHandler`
* **Implementación:**
  ```javascript
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  ```
  Esto permite que las rutas Express definan funciones asíncronas de manera directa y segura. Cualquier fallo será automáticamente capturado y enviado al manejador global.

### Decisión 3: Estructura del Error Handler
* **Ubicación:** `backend/src/middleware/errorHandler.js`.
* **Comportamiento:**
  - En desarrollo (`process.env.NODE_ENV !== 'production'`), retornará el código del estado, el mensaje del error y el stacktrace completo del error.
  - En producción, el stacktrace estará oculto.
  - Formateará de manera especial errores conocidos de Prisma.

## Risks / Trade-offs

- **[Riesgo]** Rutas rotas debido a rutas relativas incorrectas (`../../` o `./`) tras mover archivos.
  - *Mitigación:* Se auditarán todos los archivos movidos y se verificará el arranque de la app mediante una prueba de construcción e inicialización limpia.
