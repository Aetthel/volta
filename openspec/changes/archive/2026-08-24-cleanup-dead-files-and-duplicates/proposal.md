## Why

El proyecto Volta acumula más de 70 archivos duplicados con sufijos de copia de macOS (ej. `* 2.js`, `* 3.js`, `specs 2/`, etc.) repartidos entre `backend/src/generated/client/`, `backend/src/tests/`, `backend/src/workers/` y ramas de `openspec/changes/`. Además, el cliente de Prisma en `backend/src/generated/client` acumula artefactos obsoletos de compilaciones pasadas.

Eliminar de forma segura estos archivos duplicados y regenerar el cliente de Prisma reducirá el tamaño del repositorio, eliminará ruido en la compilación y evitará fallos accidentales durante la ejecución de pruebas.

## What Changes

- **Eliminación de Archivos Duplicados**: Borrado seguro de todos los archivos con patrón de copia de macOS (`* 2.*`, `* 3.*`, `* 4.*`, `* 5.*`, `* 6.*`) en backend, tests, docker y openspec.
- **Limpieza y Re-generación de Prisma Client**: Limpieza de artefactos huérfanos en `backend/src/generated/client` y ejecución de `pnpm prisma:generate`.
- **Verificación de Tests e Infraestructura**: Confirmar que los tests unitarios y la compilación de TypeScript sigan funcionando al 100% tras la limpieza.

## Capabilities

### New Capabilities
- `dead-file-cleanup`: Reglas y procesos para mantener el repositorio libre de copias huérfanas y artefactos de build duplicados.

### Modified Capabilities
<!-- No requirement changes -->

## Impact

- **Código Afectado**: Archivos duplicados en `backend/src/generated/client/`, `backend/src/tests/`, `backend/src/workers/`, `docker/` y `openspec/changes/`.
- **API & Interfaces**: Cero cambios funcionales.
- **Rendimiento y CI/CD**: Reducción de tiempo de compilación y limpieza de espacio en disco.
