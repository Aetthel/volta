## Context

El backend requiere unificar todos sus módulos restantes a la arquitectura Router-Controller-Service, aislar los esquemas Zod en un directorio unificado, estandarizar las respuestas JSON, estructurar los logs y configurar una base para tests automatizados.

## Goals / Non-Goals

**Goals:**
- Centralizar todos los esquemas Zod en `backend/src/validators/`.
- Crear el helper de respuesta estandarizada en `backend/src/utils/apiResponse.js`.
- Crear un logger básico estructurado en `backend/src/utils/logger.js`.
- Configurar Jest y Supertest en `backend/package.json` y crear un test base de demostración.
- Refactorizar las rutas restantes (`business`, `services`, `users`, `whatsapp`, `lopd`, `admin`) a Router-Controller-Service.

**Non-Goals:**
- Reescribir la lógica del frontend.

## Decisions

### Decisión 1: Clase de Respuestas Estandarizadas
Para asegurar payloads homogéneos, crearemos `apiResponse.js` con la estructura:
```javascript
export class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
  }
}
```

### Decisión 2: Logger Estructurado Simplificado
Crearemos un logger de producción básico en `utils/logger.js` para estandarizar salidas de consola.

### Decisión 3: Extracción de Zod Schemas
Todos los esquemas de validación Zod se ubicarán en `src/validators/` y se importarán desde las rutas.

## Risks / Trade-offs

- **[Riesgo]** Complejidad de Jest con ES Modules nativos.
  - *Mitigación:* Se configurará Jest usando variables de entorno de Node.js (`NODE_OPTIONS=--experimental-vm-modules`) para dar soporte nativo a ES Modules sin necesidad de compiladores externos como Babel.
