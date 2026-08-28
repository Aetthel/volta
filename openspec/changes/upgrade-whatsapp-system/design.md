# Design: Upgrade WhatsApp Messaging System with Multi-Tenant & Intent Classification

## Context

El proyecto `volta` necesita un sistema de mensajería escalable para que múltiples negocios envíen recordatorios/notificaciones a sus clientes y procesen automáticamente las respuestas mediante clasificación de intenciones. Véase [proposal.md](file:///Users/kore/Documents/Code/Projects/volta/openspec/changes/upgrade-whatsapp-system/proposal.md).

## Goals / Non-Goals

**Goals:**
- Desplegar **Evolution API v2** junto a **PostgreSQL** en Docker para persistencia de sesiones multi-instancia.
- Soportar multi-negocio: cada empresa vincula su WhatsApp mediante su propio código QR.
- Implementar un clasificador bidireccional híbrido (Reglas deterministas + fallback a LLM en Groq/OpenAI) que asigne estados (`CONFIRMADO`, `CANCELADO`, `SOLICITA_CAMBIO`, `REQUIERE_HUMANO`).
- Mantener los costes de IA en **0 €** (Groq Free Tier) o despreciables (<0.0001€/mensaje con OpenAI).
- Desacoplar la lógica de mensajería con una interfaz `WhatsAppProvider`.

**Non-Goals:**
- Procesamiento y transcripción de notas de voz/audio en esta primera fase (enfoque 100% en texto e imágenes/documentos).
- CRM complejo de mensajería en vivo dentro de Volta (se deja abierta la conexión con Chatwoot si se requiere en el futuro).

## Decisions

### 1. Motor de WhatsApp y Persistencia
- **Decisión**: Utilizar `evolution-api` oficial v2 en Docker con base de datos PostgreSQL.
- **Razón**: Proporciona API REST, Swagger, Webhooks en tiempo real, gestión nativa de instancias por negocio y persistencia segura de tokens sin consumir más de ~50MB de RAM por instancia.

### 2. Multi-Tenancy (Instancias por Negocio)
- **Decisión**: Nombrar cada instancia en Evolution API con el identificador del negocio (`business_<id>`).
- **Razón**: Permite aislar completamente las sesiones, números de teléfono y webhooks de cada cliente de Volta.

### 3. Pipeline de Clasificación de Respuestas en 2 Niveles
- **Decisión**:
  - *Nivel 1 (Regex/Keywords)*: Clasificación instantánea (0ms, 0€) para respuestas cortas típicas.
  - *Nivel 2 (LLM Classifier)*: Llamada a micro-prompt JSON estructurado (usando Groq `llama-3.3-70b-versatile` gratis o `gpt-4o-mini`) solo cuando el nivel 1 no clasifica con confianza.
- **Razón**: Minimiza el uso de APIs externas al 20-30% de los mensajes y garantiza precisión con cualquier variación de lenguaje natural.

## Risks / Trade-offs

- **[Riesgo de bloqueo de cuentas de WhatsApp]** → *Mitigación*: Fomentar que cada negocio utilice su número operativo normal, añadir intervalos de delay entre envíos masivos y limitar el spam.
- **[Caída de la API de IA]** → *Mitigación*: Si el LLM falla o se agota la cuota, el sistema marca el mensaje como `REQUIERE_HUMANO` por defecto para que ningún mensaje se pierda.

## Migration Plan

1. Levantar stack Docker (`evolution-api` + `postgres`).
2. Configurar webhook en Evolution API apuntando al endpoint de Volta Backend `/api/webhooks/whatsapp`.
3. Implementar módulo clasificador `IntentClassifier` en backend.
4. Conectar el flujo de citas/recordatorios con el envío y actualización automática de estado.
