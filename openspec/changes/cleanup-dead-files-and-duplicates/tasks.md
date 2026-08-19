## 1. Identificación y Eliminación de Archivos Duplicados

- [x] 1.1 Eliminar los archivos duplicados de Prisma Client en `backend/src/generated/client/`
- [x] 1.2 Eliminar los tests y workers duplicados en `backend/src/tests/` y `backend/src/workers/`
- [x] 1.3 Eliminar archivos y carpetas duplicados en `openspec/changes/` y `docker/`

## 2. Regeneración de Artefactos de Build y Verificación

- [x] 2.1 Regenerar el cliente oficial de Prisma con `pnpm prisma:generate` en `backend/`
- [x] 2.2 Ejecutar las suites de pruebas de backend y frontend para confirmar cero regresiones
