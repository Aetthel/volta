## Context

Durante la fase de exploración se detectó la presencia de más de 70 archivos duplicados producto de operaciones de copia involuntarias en el sistema operativo macOS (archivos con sufijos ` 2`, ` 3`, ` 4`, ` 5`, ` 6`).

Estos archivos ocupan espacio en disco, distorsionan el rastreo de Git y causan ruido en los autocompletados de código e importaciones.

## Goals / Non-Goals

**Goals:**
- Eliminar sistemáticamente todos los archivos y directorios duplicados detectados.
- Regenerar el cliente de Prisma de forma limpia.
- Validar la ejecución de los tests del backend y frontend.

**Non-Goals:**
- Modificar lógica de negocio o esquemas de base de datos.

## Decisions

### Decision 1: Eliminación Seleccionada por Patrón de Nombre
- **Opción Elegida**: Eliminar archivos que coincidan con `* [2-9]*` asegurando que no pertenezcan a librerías de `node_modules`.
- **Razón**: Permite la eliminación segura de copias sin afectar el código fuente original.

## Risks / Trade-offs

- [Riesgo] Borrar accidentalmente un archivo original si su nombre contiene legítimamente un número.
  → *Mitigación*: Inspección previa del listado exacto de archivos objetivo antes del borrado.
