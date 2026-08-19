## Why

La infraestructura de despliegue actual presenta incoherencias entre la compilación de desarrollo y producción: `Dockerfile.prod` usa secretos duros fijados (`dummy`) en tiempo de build, y las configuraciones de Docker Compose carecen de comprobaciones de salud (*healthchecks*) unificadas para el contenedor de backend y frontend.

Unificar la imagen Docker mediante un archivo multi-stage con targets explícitos (`development` y `production`) y fortalecer los healthchecks aumentará la seguridad y estabilidad del despliegue en cualquier entorno.

## What Changes

- **Dockerfile Multi-stage Unificado**: Crear un `Dockerfile` único estructurado por etapas (`base`, `deps`, `builder`, `dev`, `runner`).
- **Seguridad en Tiempos de Build**: Eliminar valores dummy hardcoded reemplazándolos con `ARG` explícitos.
- **Healthchecks y Dependencias en Docker Compose**: Añadir comprobación de salud en el contenedor de backend (`/health`) y actualizar `docker-compose.prod.yml`.

## Capabilities

### New Capabilities
- `devops-docker-infrastructure`: Estándares de contenedorización multi-stage y comprobaciones de salud de servicios.

### Modified Capabilities
<!-- No requirement changes -->

Native impact: `Dockerfile`, `Dockerfile.prod`, `docker-compose.yml`, `docker-compose.prod.yml`.
