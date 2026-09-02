# Volta Backend — TypeScript & Arquitectura de Desarrollo

Este documento describe la arquitectura de desarrollo del backend de Volta, la configuración del runtime de TypeScript y las pautas para desarrolladores y agentes de IA.

---

## 1. Filosofía de Migración Progresiva

El backend de Volta opera bajo un modelo **híbrido progresivo**:
- **Coexistencia**: Archivos `.js` existentes y nuevos archivos `.ts` conviven transparentemente en el mismo proyecto bajo ESM (`"type": "module"`).
- **Ejecución Directa con `tsx`**: No se realiza una compilación previa a disco (`dist/`) durante el desarrollo local. `tsx` compila en memoria mediante `esbuild` y recarga en caliente de forma instantánea.
- **Verificación Estricta sin Emisión**: Los agentes y desarrolladores validan la integridad de tipos mediante `tsc --noEmit`.

---

## 2. Pautas para Nuevos Módulos (Para Desarrolladores y Agentes de IA)

1. **Crear nuevos módulos siempre en TypeScript (`.ts`)**:
   - Nuevos controladores, servicios, utilidades o middlewares deben crearse directamente con extensión `.ts`.
   - Evitar el uso de `any`; definir interfaces explícitas o inferir tipos desde Zod.

2. **Acceso a la Base de Datos**:
   - Importar el cliente tipado de Prisma desde `src/config/db.ts`:
     ```typescript
     import prisma from "../config/db.ts"; // o "../config/db.js"
     ```
   - Aprovechar el autocompletado y validación de tipos estáticos de Prisma Client.

3. **Esquemas de Validación y DTOs**:
   - Definir esquemas Zod en `src/validators/` y siempre exportar el tipo inferido:
     ```typescript
     export const myFeatureSchema = z.object({ ... });
     export type MyFeatureInput = z.infer<typeof myFeatureSchema>;
     ```

4. **Contexto de Peticiones y Autenticación**:
   - Importar tipos comunes desde `src/types/index.ts`:
     ```typescript
     import type { AuthRequest, ApiResponse } from "../types/index.js";
     ```

---

## 3. Comandos de Desarrollo

```bash
# Iniciar servidor en caliente con soporte TypeScript
pnpm --filter backend dev

# Comprobación estática de tipos (ejecutar antes de dar por completada una tarea)
pnpm --filter backend typecheck

# Inspeccionar configuración efectiva del compilador
pnpm --filter backend exec tsc --showConfig
```

---

## 4. Estructura de Tipos y Runtime

- **`backend/tsconfig.json`**: Configuración `NodeNext` con `allowJs: true`, `checkJs: false` y `strict: true` aplicado a archivos `.ts`.
- **`backend/src/types/index.ts`**: Tipos globales de autenticación (`AuthUser`, `AuthRequest`), respuestas de API (`ApiResponse`) y paginación.
- **`backend/src/validators/index.ts`**: Esquemas de validación Zod con tipos inferidos exportados.
- **`backend/src/config/db.ts`**: Instancia centralizada de Prisma con extensiones tipadas (`ExtendedPrismaClient`).
