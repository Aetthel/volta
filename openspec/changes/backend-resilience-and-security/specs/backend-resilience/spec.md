## ADDED Requirements

### Requirement: Validación Estricta de Variables de Entorno
El servidor backend DEBE detener su proceso inmediatamente al iniciar si faltan variables de entorno requeridas o si los secretos clave contienen valores inseguros por defecto en entorno de producción.

#### Scenario: Fallo de arranque por falta de secretos
- **WHEN** el backend inicia sin definir `BACKEND_JWT_SECRET` o `DATABASE_URL`
- **THEN** el proceso lanza una excepción explicativa de configuración y finaliza con código de salida 1

### Requirement: Apagado Controlado (Graceful Shutdown)
Al recibir una señal del sistema (`SIGINT` o `SIGTERM`), el servidor DEBE dejar de aceptar nuevas conexiones HTTP, vaciar las colas activas de Redis y cerrar el pool de conexiones de Prisma antes de terminar.

#### Scenario: Recepción de señal SIGTERM en contenedor
- **WHEN** el orquestador o contenedor envía la señal `SIGTERM`
- **THEN** el servidor cierra el puerto HTTP, desconecta la base de datos y finaliza en menos de 5 segundos

### Requirement: Validación Zod en Reserva Pública
Todas las peticiones entrantes a `/api/public/booking` DEBEN ser validadas contra un esquema Zod antes de consultar la base de datos.

#### Scenario: Payload inválido en booking público
- **WHEN** una petición sin teléfono o con formato de fecha incorrecto llega al endpoint de reserva
- **THEN** la API responde inmediatamente con estado 400 y detalles de validación de Zod
