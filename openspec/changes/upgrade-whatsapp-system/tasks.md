# Tasks: Upgrade WhatsApp Messaging System with Multi-Tenant & Intent Classification

## 1. Infraestructura Docker (Evolution API + PostgreSQL)

- [x] 1.1 Crear `docker-compose.yml` en la raíz de `volta` con los servicios `evolution-api` (v2) y `postgres`
- [x] 1.2 Crear `.env.example` con claves de API, configuración de base de datos y credenciales de Evolution API
- [x] 1.3 Levantar el stack con `docker compose up -d` y verificar la conectividad al panel Swagger `/docs` y a PostgreSQL

## 2. Backend: Capa de Integración y Multi-Instancia

- [x] 2.1 Crear el servicio `EvolutionApiClient` en el backend para gestionar instancias multi-negocio (crear instancia `business_<id>`, generar código QR y consultar estado de conexión)
- [x] 2.2 Implementar método de envío de mensajes de texto y plantillas de recordatorio por instancia de negocio
- [x] 2.3 Implementar endpoint receptor de Webhook `/api/webhooks/whatsapp` con validación de autenticidad y extracción de payloads

## 3. Módulo de Clasificación de Intenciones

- [x] 3.1 Implementar filtro determinista (Nivel 1: Regex/Keywords) para detectar confirmaciones (`CONFIRMADO`) y cancelaciones directas (`CANCELADO`)
- [x] 3.2 Implementar cliente clasificador LLM (Nivel 2) con soporte para Groq (Llama 3.3 Gratis) y OpenAI (`gpt-4o-mini`) para etiquetar `SOLICITA_CAMBIO` y `REQUIERE_HUMANO`
- [x] 3.3 Integrar el clasificador con el webhook para actualizar el estado del recordatorio/cita correspondiente automáticamente

## 4. Pruebas y Validación End-to-End

- [x] 4.1 Realizar prueba de creación de instancia para un negocio de prueba y generación de código QR
- [x] 4.2 Probar envío de recordatorio saliente a un número de test
- [x] 4.3 Probar respuesta del cliente ("Sí confirmo", "Cancélalo", "Mejor el martes a las 5") y verificar la asignación correcta de etiquetas en el sistema
