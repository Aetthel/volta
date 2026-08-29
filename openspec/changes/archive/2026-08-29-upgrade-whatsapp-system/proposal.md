# Proposal: Upgrade WhatsApp Messaging System with Multi-Tenant & Intent Classification

## Why

El sistema actual de integración de WhatsApp (basado en `whatsapp-web.js` / Puppeteer) presenta altos consumos de memoria RAM (>500MB por sesión), inestabilidad ante actualizaciones de WhatsApp y carece de soporte multi-cuenta y clasificación automática de respuestas. Se requiere modernizar la arquitectura con Evolution API v2 en Docker (basado en Baileys por WebSockets nativos, <50MB RAM), permitiendo que múltiples negocios conecten su propio número mediante QR, envíen recordatorios/notificaciones salientes y clasifiquen automáticamente las respuestas de sus clientes en estados accionables (CONFIRMADO, CANCELADO, SOLICITA_CAMBIO, REQUIERE_HUMANO).

## What Changes

- **BREAKING**: Reemplazo total del motor basado en Puppeteer por Evolution API v2 (Baileys / WebSockets).
- Arquitectura **Multi-Negocio (Multi-Tenant)**: Cada negocio dispone de su propia instancia de WhatsApp identificada por `businessId` para vincular su número mediante QR independiente.
- Despliegue de infraestructura con `docker-compose.yml` conteniendo Evolution API v2 y base de datos PostgreSQL para persistencia de sesiones e histórico de mensajes.
- **Motor de Clasificación de Intenciones**: Módulo bidireccional que analiza las respuestas entrantes en dos niveles:
  1. *Filtro determinista* (reglas y patrones de texto directo con coste 0).
  2. *Clasificador IA ligero* (Groq Free Tier / OpenAI gpt-4o-mini) para etiquetar respuestas complejas (`CONFIRMADO`, `CANCELADO`, `SOLICITA_CAMBIO`, `REQUIERE_HUMANO`).
- Contratos REST tipados en el backend para despacho de notificaciones/recordatorios y recepción de eventos Webhook.

## Capabilities

### New Capabilities
- `whatsapp-gateway`: Gestión de instancias multi-negocio por WebSocket, generación de códigos QR independientes, persistencia en PostgreSQL y despacho de webhooks.
- `messaging-service`: Envío de recordatorios/mensajes de texto y multimedia, recepción de webhooks de clientes y actualización de estados de entrega.
- `intent-classifier`: Clasificación bidireccional de respuestas de clientes en estados (`CONFIRMADO`, `CANCELADO`, `SOLICITA_CAMBIO`, `REQUIERE_HUMANO`) mediante reglas rápidas y fallback a LLM.

### Modified Capabilities

## Impact

- **Infraestructura**: Se añade `docker-compose.yml` con servicios `evolution-api` y `postgres`.
- **Backend**: Módulos desacoplados para gestión de instancias, envío de notificaciones y procesamiento inteligente de webhooks de entrada.
- **Negocio**: Los clientes de cada negocio reciben recordatorios automáticos y sus respuestas se clasifican sin intervención manual.
