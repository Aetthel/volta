## ADDED Requirements

### Requirement: Dockerfile Multi-stage Unificado
La configuración de Docker DEBE utilizar un único `Dockerfile` multi-stage que permita construir imágenes tanto para desarrollo (`target: dev`) como para producción (`target: runner`) compartiendo las capas de dependencias base.

#### Scenario: Construcción de imagen de producción
- **WHEN** se ejecuta `docker build --target runner`
- **THEN** la imagen final no contiene dependencias de desarrollo ni herramientas de compilación no necesarias

### Requirement: Healthcheck en Contenedor de Backend
El servicio de backend en `docker-compose.yml` DEBE incluir un `healthcheck` que consulte periódicamente el endpoint `/health` antes de declarar el servicio como disponible para el frontend.

#### Scenario: Arranque ordenado en Docker Compose
- **WHEN** se inicia la pila con `docker compose up`
- **THEN** el servicio frontend aguarda a que el servicio backend reporte estado `healthy` a través de `/health`
