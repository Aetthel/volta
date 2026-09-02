## 1. Configuración de Infraestructura TypeScript

- [x] 1.1 Instalar dependencias de desarrollo (`typescript`, `tsx`, `@types/node`, `@types/express`, `@types/bcryptjs`, `@types/qrcode`, `@types/supertest`) en `backend/package.json` y verificar instalación limpia con `pnpm install`.
- [x] 1.2 Crear `backend/tsconfig.json` con configuración NodeNext, `allowJs: true`, `checkJs: false`, `noEmit: true` y `strict: true` para archivos `.ts`, y verificar configuración con `pnpm --filter backend exec tsc --showConfig`.
- [x] 1.3 Configurar scripts en `backend/package.json` agregando `"typecheck": "tsc --noEmit"` y actualizando `"dev": "tsx watch src/index.js"`, verificando que `pnpm --filter backend typecheck` se ejecute sin errores.

## 2. Migración del Core de Base de Datos y Tipos

- [x] 2.1 Migrar `backend/src/config/db.js` a `backend/src/config/db.ts` con tipado estricto de la instancia de Prisma y verificar que exporta correctamente tanto para módulos `.js` como `.ts`.
- [x] 2.2 Crear `backend/src/types/index.ts` para centralizar definiciones de tipos de sesión/autenticación (`AuthRequest`, roles) y contratos comunes, verificando su compilación con `pnpm --filter backend typecheck`.
- [x] 2.3 Tipar esquemas y validadores Zod en `backend/src/validators/` infiriendo los tipos TypeScript (`z.infer`) y verificar que se exportan los contratos de datos correspondientes.

## 3. Verificación de Ejecución, Tests y Flujo de Agentes

- [x] 3.1 Iniciar el backend con el nuevo runner `tsx` y verificar que el servidor responde a las peticiones HTTP y a la conexión a Postgres y Redis.
- [x] 3.2 Ejecutar la suite de pruebas del backend (`pnpm --filter backend test`) asegurando que todos los tests continúan pasando sin regresiones.
- [x] 3.3 Documentar el estándar de desarrollo para agentes y desarrolladores en las reglas del proyecto (`backend/README.md` o `.agents/`), indicando cómo crear nuevos módulos directamente en `.ts` y validar con `pnpm --filter backend typecheck`.
