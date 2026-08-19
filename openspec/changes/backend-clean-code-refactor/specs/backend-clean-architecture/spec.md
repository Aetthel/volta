## ADDED Requirements

### Requirement: Manejo Unificado de Errores en Express
Todos los controladores del backend DEBEN delegar la captura de excepciones no controladas al middleware de errores centralizado en lugar de silenciar excepciones o devolver objetos de error inconsistentes.

#### Scenario: Excepción en controlador captura error 500
- **WHEN** un controlador lanza un error de ejecución o fallo de base de datos
- **THEN** el middleware global intercepta la excepción y retorna un formato JSON estándar `{ error: string }` con código HTTP correspondiente

### Requirement: Validación de Entrada con Cláusulas de Guarda
Cada controlador de la API DEBE validar los parámetros de la solicitud (`req.params`, `req.query`, `req.body`) al inicio del handler y retornar inmediatamente (*early return*) en caso de entrada inválida.

#### Scenario: Petición con ID o payload inválido
- **WHEN** una solicitud HTTP llega sin los campos requeridos
- **THEN** el controlador responde inmediatamente con un código 400 Bad Request sin ejecutar lógica secundaria
