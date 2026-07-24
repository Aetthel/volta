## Context

El backend actualmente contiene la lógica de negocio acoplada en los archivos de rutas de Express. Se implementará una arquitectura desacoplada Router-Controller-Service.

## Goals / Non-Goals

**Goals:**

- Crear los directorios `backend/src/controllers/` y `backend/src/services/`.
- Refactorizar las rutas principales (`clients.js` y `appointments.js`) bajo el nuevo patrón.
- Mantener compatibilidad absoluta con ES Modules y extensiones `.js`.

**Non-Goals:**

- Cambiar la lógica o modelo de base de datos de Prisma.

## Decisions

### Decisión 1: Separación de Responsabilidades

- Las rutas (`routes/`) solo definirán los paths HTTP, esquemas de validación Zod y validaciones de ID, y delegarán el control a los controladores.
- Los controladores (`controllers/`) extraerán parámetros y llamarán a los servicios correspondientes.
- Los servicios (`services/`) recibirán parámetros limpios de HTTP, accederán a la base de datos y retornarán los resultados.

## Risks / Trade-offs

- **[Riesgo]** Errores por imports relativos rotos.
  - _Mitigación:_ Se validará minuciosamente cada ruta importada y se ejecutará una compilación estática de control.
