## Context

Reestructuración del flujo de construcción en Docker para optimizar el tamaño de las imágenes finales y mejorar la seguridad en entornos contenerizados.

## Goals / Non-Goals

**Goals:**
- Unificar `Dockerfile` y `Dockerfile.prod` en una estrategia multi-stage limpia.
- Añadir healthcheck en `/health` para el contenedor backend.

**Non-Goals:**
- Alterar la configuración de la red de Cloudflare Tunnel.

## Decisions

### Decision 1: Multi-stage Build con Capas de Caché
- **Opción Elegida**: Separar etapas `base` -> `deps` -> `builder` -> `runner`.
- **Razón**: Acelera sustancialmente los tiempos de build subsiguientes al aprovechar la caché de Docker.
