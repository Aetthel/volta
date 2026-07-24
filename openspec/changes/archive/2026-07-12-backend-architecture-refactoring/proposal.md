## Why

La lógica de negocio, las consultas de base de datos y la gestión HTTP están muy acopladas dentro de los archivos de rutas de Express. Esto dificulta realizar pruebas unitarias, reusar código e incrementa la complejidad del mantenimiento a largo plazo.

## What Changes

- **Introducir Capa de Controladores (Controllers)**: Extraer la lógica de manejo HTTP (req, res, status codes) de los archivos de rutas a la nueva carpeta `backend/src/controllers/`.
- **Introducir Capa de Servicios (Services)**: Extraer la lógica de negocio y consultas de base de datos (Prisma) a la nueva carpeta `backend/src/services/`.
- **Simplificar Rutas (Routers)**: Dejar los archivos de rutas únicamente encargados de declarar las rutas, inyectar middlewares de autenticación/validación y llamar a sus respectivos controladores.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `project-modular-structure`: Migrar los módulos del backend de un diseño plano de enrutadores gordos a un diseño limpio Router-Controller-Service desacoplado.

## Impact

- **`backend/src/`**: Creación de los directorios `controllers/` y `services/`.
- **Archivos de Rutas (`routes/`)**: Reducción drástica del tamaño del código delegando la lógica al controlador.
