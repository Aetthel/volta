## Context

El backend de Volta opera sobre Node.js (v22+) con ESM nativo (`"type": "module"` en `package.json`), Express 5, Prisma 7 y BullMQ/Redis. Actualmente se ejecuta con `nodemon src/index.js` y no posee archivo `tsconfig.json`. La suite de tests corre con Jest en modo ESM.

Ver `proposal.md` para la justificación y alcance estratégico de la migración para agentes de IA y desarrolladores.

## Goals / Non-Goals

**Goals:**
- Configurar un entorno TypeScript de ejecución directa (`tsx`) y verificación estática (`tsc`) sin emitir artefactos a `dist/` durante el desarrollo local.
- Permitir la coexistencia transparente de código JavaScript (`.js`) y TypeScript (`.ts`) mediante `allowJs: true`.
- Migrar archivos fundamentales: configuración de base de datos (`src/config/db.ts`), validadores Zod compartidos y utilidades de tipos (`src/types/`).
- Mantener la suite de tests funcionando sin interrupciones durante el proceso.

**Non-Goals:**
- Migración "Big Bang" de los 112 archivos JS del backend en un solo paso.
- Reescribir la arquitectura de controladores o servicios existentes que estén estables en `.js`.
- Cambiar la base de datos o esquemas de Prisma.

## Decisions

### 1. Runner de ejecución: `tsx` en lugar de `ts-node` o compilación manual con `tsc`
- **Decisión**: Usar `tsx` (`tsx watch src/index.js` o `src/index.ts`) para el entorno de desarrollo y ejecución directa.
- **Justificación**: `tsx` está construido sobre `esbuild`, soporta ESM de Node de forma nativa sin flags experimentales, no requiere pasos previos de transpilación y es instantáneo en recarga en caliente.
- **Alternativas consideradas**:
  - `ts-node`: Conflictos notorios con ESM (`"type": "module"`) y configuraciones lentas de `loader`.
  - `tsc -w`: Genera archivos duplicados en disco (`dist/`), añade fricción con rutas relativas de imports y ralentiza el ciclo de feedback de los agentes.

### 2. Configuración de `tsconfig.json`: Híbrida y progresiva (`allowJs: true`, `checkJs: false`)
- **Decisión**: Configurar `tsconfig.json` con:
  - `"target": "ES2022"`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`
  - `"allowJs": true` y `"checkJs": false`
  - `"noEmit": true` (delegando la ejecución a Node/`tsx`)
  - `"strict": true` aplicado únicamente a los archivos `.ts`.
- **Justificación**: Permite que cualquier archivo `.ts` nuevo o migrado tenga comprobación estricta de tipos, mientras que el código `.js` existente continúa ejecutándose sin arrojar miles de errores falsos positivos.
- **Alternativas consideradas**:
  - `"strict": false`: Menos fricción inicial, pero reduce drásticamente el valor de TypeScript para los agentes de IA.

### 3. Migración por capas concéntricas (Tipos -> Configuración -> Validadores -> Servicios)
- **Decisión**:
  1. Fase 1: Infraestructura base (`package.json`, `tsconfig.json`, script `typecheck`).
  2. Fase 2: Core de base de datos (`src/config/db.ts` con tipado de Prisma).
  3. Fase 3: Validadores de Zod (`src/validators/`) y tipado de DTOs.
  4. Fase 4: Migración progresiva de servicios y controladores bajo demanda.
- **Justificación**: Minimiza el riesgo y asegura que la base tipada esté disponible antes de que los controladores consuman tipos.

## Risks / Trade-offs

- **[Riesgo] Extensiones de importación en ESM de Node (`.js` vs `.ts`)**
  - *Mitigación*: Con NodeNext en ESM, TypeScript requiere que los imports especifiquen `.js` o bien se use la resolución flexible de `tsx`. Se utilizarán imports estándar compatibles con NodeNext y `tsx`.
- **[Riesgo] Incompatibilidad de tests Jest existentes con TypeScript**
  - *Mitigación*: En la fase inicial, los tests existentes seguirán ejecutándose en Jest sobre los archivos `.js`. Para nuevos tests en TypeScript o migración paulatina, se evaluará la transición de Jest a Vitest (ya configurado en frontend).
- **[Riesgo] Sobrecarga de tipos `any` por parte de agentes**
  - *Mitigación*: La regla de ESLint/TypeScript prohibirá `any` explícito en archivos `.ts` nuevos y se aplicará la skill `typescript-strict-refactor`.

## Migration Plan

1. Instalar dependencias dev en `backend/package.json`.
2. Crear `backend/tsconfig.json`.
3. Actualizar scripts en `backend/package.json` (`dev` con `tsx watch`, `typecheck` con `tsc --noEmit`).
4. Migrar `backend/src/config/db.js` a `backend/src/config/db.ts` y verificar tipos con Prisma.
5. Ejecutar `pnpm --filter backend typecheck` y verificar que el servidor levanta con `pnpm --filter backend dev`.
