## 1. Configuración del Proyecto

- [x] 1.1 Habilitar ES Modules añadiendo `"type": "module"` en `backend/package.json`.

## 2. Refactorización de Archivos Estructurales

- [x] 2.1 Convertir utilitarios y archivos de configuración en `backend/src/config/` y `backend/src/utils/` a ES Modules.
- [x] 2.2 Convertir los middlewares en `backend/src/middleware/` a ES Modules.
- [x] 2.3 Convertir los servicios en `backend/src/services/` a ES Modules.

## 3. Refactorización de Rutas e index.js

- [x] 3.1 Convertir todos los controladores de rutas en `backend/src/routes/` a ES Modules, asegurando agregar la extensión `.js` a las importaciones relativas.
- [x] 3.2 Refactorizar `backend/src/index.js` a ES Modules, reemplazar `require.main` y validar el inicio exitoso del backend.
