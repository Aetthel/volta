## Purpose

Proporciona un entorno de ejecución y verificación estática de TypeScript para el backend de Volta, permitiendo interoperabilidad híbrida con JavaScript y tipado estricto entre Prisma, validadores y APIs.

## ADDED Requirements

### Requirement: Ejecución nativa y en caliente de TypeScript
El backend SHALL permitir la ejecución directa y desarrollo en caliente de archivos TypeScript sin necesidad de un paso de transpilación explícito a disco previo a la ejecución.

#### Scenario: Inicio del servidor en modo desarrollo
- **WHEN** el desarrollador o agente ejecuta `pnpm --filter backend dev`
- **THEN** el entorno debe iniciar el servidor Node utilizando `tsx watch` reconociendo tanto archivos `.ts` como `.js` de forma transparente.

### Requirement: Verificación estática de tipos sin emisión
El backend SHALL proporcionar un comando de verificación estática de tipos que valide todo el código sin generar artefactos de compilación redundantes en disco.

#### Scenario: Comprobación de tipos en CI o por agentes de IA
- **WHEN** se ejecuta `pnpm --filter backend typecheck`
- **THEN** el compilador TypeScript (`tsc --noEmit`) analiza los archivos tipados y reporta los errores de tipo existentes con código de salida no nulo si existen fallos, o 0 si el proyecto compila limpiamente.

### Requirement: Interoperabilidad híbrida JS y TS
El sistema SHALL permitir la coexistencia de módulos JavaScript (`.js`) y TypeScript (`.ts`) durante la migración sin romper los módulos existentes.

#### Scenario: Importación mutua entre módulos JS y TS
- **WHEN** un archivo `.ts` importa una función o servicio desde un archivo `.js` existente (o viceversa)
- **THEN** la resolución de módulos ESM se completa correctamente en tiempo de ejecución y el compilador permite la coexistencia sin requerir migración masiva forzada.

### Requirement: Tipado estricto en la capa de datos Prisma
El backend SHALL exportar y utilizar tipos fuertemente tipados a partir del cliente centralizado de Prisma para todas las consultas y mutaciones de base de datos en archivos TypeScript.

#### Scenario: Tipado seguro de modelos y relaciones
- **WHEN** un servicio escrito en TypeScript consulta datos mediante `prisma`
- **THEN** los resultados y argumentos de búsqueda están completamente tipados según el esquema de Prisma, autocompletando relaciones y campos requeridos.
