## Why

El backend del proyecto Volta utiliza CommonJS (`require`), mientras que el frontend utiliza ES Modules (`import`). Para homogeneizar el estilo de codificación en todo el monorepo y utilizar estándares modernos de Node.js, transitionaremos el backend a ES Modules nativos.

## What Changes

- **Habilitación de ES Modules en Backend**: Añadir `"type": "module"` en `backend/package.json`.
- **Refactorización de Sintaxis**: Reemplazar todas las sentencias CommonJS (`require` y `module.exports`) por ES Modules (`import` y `export default` o `export const`) en todo el backend.
- **Detección del Entry Point**: Adaptar la verificación de ejecución directa del servidor (`require.main === module`) usando `import.meta.url` y `process.argv[1]`.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `project-modular-structure`: Unificación sintáctica de los módulos de la aplicación, usando estándares modernos de ES Modules en el backend.

## Impact

- **`backend/package.json`**: Se agrega `"type": "module"`.
- **Archivos del Backend (`backend/src/`)**: Todos los archivos `.js` de rutas, controladores, servicios, configuración y utilidades serán modificados.
