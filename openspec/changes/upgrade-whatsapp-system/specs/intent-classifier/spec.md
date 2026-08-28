## Purpose

Analiza el contenido de los mensajes entrantes de los clientes para clasificar su intención y asignar una etiqueta de estado operativa al recordatorio o conversación.

## ADDED Requirements

### Requirement: Deterministic Pattern Classification
The system SHALL evaluate incoming client messages against known keyword patterns to assign statuses instantly with zero AI overhead.

#### Scenario: Affirmative confirmation message
- **WHEN** a client responds with messages matching affirmative patterns (e.g. "sí", "si", "confirmo", "ok", "vale", "1")
- **THEN** the classifier assigns the tag `CONFIRMADO` and updates the associated record

#### Scenario: Explicit cancellation message
- **WHEN** a client responds with messages matching cancellation patterns (e.g. "no", "cancelo", "no puedo", "anular", "2")
- **THEN** the classifier assigns the tag `CANCELADO` and updates the associated record

### Requirement: AI-Assisted Contextual Classification
The system SHALL invoke a lightweight LLM (Groq / OpenAI) for ambiguous or conversational messages that do not match deterministic patterns.

#### Scenario: Rescheduling request classification
- **WHEN** a client responds with a schedule change request (e.g. "No me va bien a las 10, ¿podríamos a las 17:00?")
- **THEN** the AI classifier categorizes the message as `SOLICITA_CAMBIO` with the extracted intent

#### Scenario: General inquiry or complaint requiring human intervention
- **WHEN** a client responds with a specific question or complaint (e.g. "¿Cuánto cuesta el tratamiento?" or "¿Dónde aparco?")
- **THEN** the AI classifier categorizes the message as `REQUIERE_HUMANO` and alerts the business owner
