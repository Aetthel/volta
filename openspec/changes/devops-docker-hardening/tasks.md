## 1. Contenedorización y Multi-stage

- [x] 1.1 Refactorizar `Dockerfile` para soportar etapas `dev` y `runner`
- [x] 1.2 Eliminar argumentos dummy en `Dockerfile.prod`

## 2. Orquestación y Healthchecks

- [x] 2.1 Añadir comprobación de salud (`healthcheck`) con `/health` en el servicio backend de `docker-compose.yml`
- [x] 2.2 Sincronizar `docker-compose.prod.yml` con la nueva estructura multi-stage

## 3. Pruebas y Validación

- [x] 3.1 Validar la construcción de la imagen de producción (`docker build --target runner .`)
