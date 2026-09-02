## Why

Actualmente el frontend opera bajo TypeScript con tipado estático estricto, mientras que el backend ejecuta JavaScript puro en Node.js ESM. Esta asimetría incrementa el riesgo de regresiones cuando agentes autónomos de IA y desarrolladores refactorizan contratos de API, esquemas de base de datos o utilidades compartidas.

Migrar el backend a TypeScript de forma progresiva dota a los agentes de IA de un supervisor automático en tiempo de desarrollo (`tsc --noEmit`), elimina discrepancias de nomenclatura en modelos de Prisma y permite compartir esquemas de validación Zod y tipos de retorno entre cliente y servidor con cero fricción de ejecución gracias a herramientas modernas como `tsx`.

## What Changes

- **Infraestructura TypeScript en Backend**: Adición de dependencias TypeScript (`typescript`, `tsx`, `@types/node`, `@types/express`, `@types/bcryptjs`, `@types/qrcode`, `@types/supertest`) y configuración de `tsconfig.json` optimizado para Node 22 con compatibilidad híbrida (`allowJs: true`).
- **Pipeline de Ejecución y Scripts**: Reemplazo de `nodemon src/index.js` por `tsx watch src/index.js` para desarrollo en caliente sin paso de compilación previo, y adición del script `typecheck` (`tsc --noEmit`).
- **Migración por Fases**: Establecimiento del patrón de convivencia donde archivos existentes `.js` y nuevos/migrados `.ts` interoperan transparentemente sin requerir una migración Big Bang.
- **Tipado Base y Capa de Dominio**: Migración inicial de tipos transversales (`backend/src/types/`), validadores Zod (`backend/src/validators/`) y el cliente centralizado de Prisma (`backend/src/config/db.ts`).
- **Suite de Pruebas**: Configuración de ejecución de tests en TypeScript asegurando compatibilidad con los tests existentes de integración y unitarios.

## Capabilities

### New Capabilities
- `backend-typescript-runtime`: Soporte de ejecución directa de TypeScript en el backend con `tsx`, verificación estática de tipos con `tsc`, convivencia híbrida con módulos JavaScript (`allowJs`) y sincronización de tipos fuertemente tipados con Prisma y Zod.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend**:
  - Actualización de `backend/package.json` con dependencias de desarrollo y nuevos scripts (`typecheck`, `dev`).
  - Creación de `backend/tsconfig.json`.
  - Migración gradual de archivos `src/config/db.js` a `.ts` y tipado de utilidades y validadores.
- **Docker / Despliegue**: Soporte de ejecución con `tsx` o compilación nativa en contenedores sin afectar las imágenes de producción actuales.
- **Flujo de Trabajo con Agentes de IA**: Permite a los agentes validar la corrección de sus modificaciones en el backend inmediatamente ejecutando el chequeo de tipos.
