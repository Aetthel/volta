## ADDED Requirements

### Requirement: Ausencia de Archivos Duplicados por Copia de Sistema
El repositorio NO DEBE contener archivos ni directorios con patrones de duplicación accidental como `* 2.*`, `* 3.*`, `* 4.*`, `* 5.*` o `* 6.*`.

#### Scenario: Verificación de estructura sin duplicados
- **WHEN** se busca en el repositorio archivos con patrones de sufijo numérico de copia
- **THEN** la búsqueda devuelve 0 resultados en todas las carpetas del proyecto

### Requirement: Integridad del Cliente Generado de Prisma
El cliente de Prisma en `backend/src/generated/client` DEBE contener únicamente los artefactos generados válidos por el comando oficial `prisma generate`.

#### Scenario: Regeneración limpia de Prisma
- **WHEN** se limpia la carpeta de salida y se ejecuta `pnpm prisma:generate` en el backend
- **THEN** solo se generan los archivos estrictamente necesarios sin duplicados ni versiones obsoletas
