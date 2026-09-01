# external-prod-redis-postgres Specification

## Purpose
TBD - created by archiving change backend-error-and-validation-architecture. Update Purpose after archive.

## Requirements

### Requirement: Jerarquía de Errores Operacionales y Validación de Esquemas
El servidor backend SHALL utilizar la clase `AppError` para todas las excepciones controladas del dominio y middlewares de validación Zod (`validateBody`, `validateQuery`, `validateParams`) para verificar las entradas antes de invocar a los controladores.

#### Scenario: Lanzamiento de AppError y validación de entrada
- **WHEN** un cliente envía parámetros no conformes o solicita un recurso sobre el que no tiene permisos
- **THEN** el middleware interceptor captura el error y responde con el código de estado adecuado y el objeto de detalle estructurado
