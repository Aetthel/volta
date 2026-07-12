## Context

El backend actualmente utiliza CommonJS (`require`/`module.exports`). Para homogeneizar el estilo con el frontend de Next.js, habilitaremos ES Modules.

## Goals / Non-Goals

**Goals:**
- Configurar `"type": "module"` en el `package.json` del backend.
- Migrar todos los archivos de `backend/src/` a sintaxis `import`/`export`.
- Resolver la compatibilidad de variables globales de CommonJS (`__dirname`, `require.main`).

**Non-Goals:**
- Cambiar la lógica de Express o Prisma.

## Decisions

### Decisión 1: Estándares de Importación de Node.js ESM
* **File Extensions:** Todas las importaciones relativas internas deben incluir explícitamente la extensión del archivo (ej. `import config from './config/index.js'`).
* **External Imports:** Las dependencias de npm no requieren extensión (ej. `import express from 'express'`).

### Decisión 2: Reemplazo de globales de CommonJS
* **__dirname:**
  ```javascript
  import { fileURLToPath } from 'url';
  import path from 'path';
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  ```
* **require.main === module:**
  ```javascript
  import { fileURLToPath } from 'url';
  const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
  ```

## Risks / Trade-offs

- **[Riesgo]** Errores al arrancar por omisión de extensiones `.js` en importaciones relativas.
  - *Mitigación:* Se verificará meticulosamente cada importación y se correrá `npm run build` y el servidor de desarrollo para comprobar el funcionamiento.
