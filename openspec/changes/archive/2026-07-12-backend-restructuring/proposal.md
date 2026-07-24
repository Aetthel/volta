## Why

El backend actual del proyecto Volta sigue un diseño plano ("Fat Routers") donde la lógica de enrutamiento HTTP, la validación de datos, la lógica de negocio y las consultas de base de datos están mezcladas en los archivos de rutas. Esto dificulta la mantenibilidad, escalabilidad y legibilidad del código. Además, la falta de un manejador de errores global y el uso excesivo de bloques `try/catch` redundantes genera código repetitivo (boilerplate) innecesario.

## What Changes

- **Restructuración de Carpetas Modular**: Crear subdirectorios específicos en `backend/src/` (`config/`, `middleware/`, `routes/`, `services/`, `utils/`) y migrar los archivos correspondientes para separar las responsabilidades.
- **Manejador de Errores Centralizado (Global Error Handler)**: Implementar un middleware centralizado para capturar errores de Express y formatear las respuestas HTTP de forma unificada.
- **Utilitario asyncHandler**: Crear un wrapper para controladores asíncronos que redirija de manera automática las excepciones no capturadas al middleware de errores, permitiendo eliminar los bloques `try/catch` redundantes de las rutas.
- **Desacoplamiento de Middlewares**: Dividir el archivo `middleware.js` único en archivos de responsabilidad única (`auth.js`, `validation.js`, `errorHandler.js`).

## Capabilities

### New Capabilities

- Ninguna. Se trata de una refactorización de código y organización interna.

### Modified Capabilities

- `project-modular-structure`: Robustecer la organización física y el acoplamiento lógico del backend, estructurándolo bajo un diseño modular limpio de responsabilidades separadas.

## Impact

- **Estructura del Backend (`backend/src/`)**: Creación de nuevas carpetas y reubicación de todos los archivos de configuración, lógica de base de datos, utilitarios, middlewares y rutas.
- **Manejo de Errores**: Simplificación de los archivos de rutas al eliminar bloques `try/catch` duplicados en cada endpoint.
