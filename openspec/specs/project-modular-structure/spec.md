# Capability: Project Modular Structure

## Purpose

TBD - This capability defines the physical structure of the codebase, dividing it into distinct workspaces (frontend, backend, etc.) for separation of concerns and independent deployment.

## Requirements

### Requirement: Modular Directory Separation

The codebase SHALL be physically separated into distinct directories to enforce boundary contexts between the user interface and background services.

#### Scenario: Developer navigation

- **WHEN** a developer inspects the project root
- **THEN** they MUST see clear boundary folders (e.g., `frontend/` and `backend/`) separating the web dashboard from the bot operations.

### Requirement: Shared Dependency Resolution

The project SHALL utilize a package manager workspace feature (e.g., NPM workspaces) to resolve shared dependencies and configurations.

#### Scenario: Installing dependencies

- **WHEN** running `npm install` at the project root
- **THEN** dependencies for both `frontend` and `backend` MUST be installed and hoisted where appropriate without conflicts.

### Requirement: Independent Execution Contexts

The frontend and backend services SHALL have distinct execution scripts and environment contexts.

#### Scenario: Running the platform locally

- **WHEN** executing the development scripts
- **THEN** it MUST be possible to run the Next.js dashboard independently from the WhatsApp bot, or both concurrently via a unified root script.

### Requirement: Granular Backend Directory Separation

The backend service SHALL partition its internal codebase into domain-specific subdirectories (`config/`, `middleware/`, `routes/`, `services/`, `utils/`) to prevent file clutter and isolate concerns.

#### Scenario: Inspecting backend source directory

- **WHEN** a developer lists the contents of `backend/src/`
- **THEN** they MUST see only clean categorization folders rather than a flat list of config, bot, database, and utility files.

### Requirement: Centralized Error Propagation

The backend API SHALL capture all route-level exceptions asynchronously and format the error responses using a single global Express error handler middleware.

#### Scenario: Database connection error in a route

- **WHEN** a database query in a router fails or throws an exception
- **THEN** the error is caught by `asyncHandler`, propagated to `next(error)`, and the client receives a standardized JSON error response.

### Requirement: Unified Monorepo Module Standards

The backend service SHALL utilize native ES Modules (`import`/`export`) for file and dependency imports to align with frontend JavaScript/TypeScript standards.

#### Scenario: Running the backend with ES Modules

- **WHEN** the backend is executed
- **THEN** it runs natively as an ES Module, correctly loading dependencies with fully specified file extensions (e.g., `.js` for relative imports).

### Requirement: Router-Controller-Service Architectural Pattern

The backend service SHALL structure its API logic using the Router-Controller-Service architectural pattern:

- **Router Layer:** Defines API paths, parameter validations, and authorization middlewares.
- **Controller Layer:** Translates HTTP inputs (body, query, parameters) to service inputs, invokes services, and formats HTTP responses.
- **Service Layer:** Performs pure database mutations and queries, independent of HTTP contexts, enabling isolated execution and testing.

#### Scenario: Registering a client through routes

- **WHEN** a client registration endpoint is requested
- **THEN** the router validates the schema, the controller maps the request, the service writes to the database and schedules welcome messaging, and the controller responds with a 201 Created status.

### Requirement: Uniform Backend Architecture and Code Polishing

The backend service SHALL enforce architectural consistency and code quality across all domains:

- **Router-Controller-Service Consistency:** ALL API routes must use the decoupled architecture.
- **Unified Validation:** Zod schemas must be centralized and isolated from HTTP and database adapters.
- **Unified Responses:** All API responses must follow a consistent JSON envelope structure.
- **Structured Logging:** Console logging must be structured with support for log levels.
- **Automated Testing Suite:** Endpoints and services must have Jest/Supertest configuration for unit and integration testing.

#### Scenario: Running test suite

- **WHEN** the test script is executed
- **THEN** all backend unit and integration tests run and verify endpoint functionality and mock databases.

### Requirement: Descomposición y Cohesión de Vistas Complejas
Los componentes de interfaz de usuario de alta interacción (como el gestor de eventos y calendario) SHALL desacoplar la lógica de navegación temporal, filtrado y gestión de estado modal en custom hooks especializados, aislando las vistas de renderizado en submódulos dedicados.

#### Scenario: Uso del gestor de calendario con hooks extraídos
- **WHEN** un desarrollador inspecciona o modifica el gestor de calendario
- **THEN** la lógica de navegación de fechas y filtrado por categorías/etiquetas reside en hooks modulares independientes de los componentes de renderizado de cuadrícula

### Requirement: Estandarización de Guard Clauses y Reducción de Complejidad
Las funciones y manejadores de eventos tanto en el frontend como en el backend SHALL utilizar guard clauses y retornos tempranos (*early returns*) para mantener la profundidad de anidamiento de bloques `if` en un máximo de 2 niveles.

#### Scenario: Validación de parámetros en manejadores
- **WHEN** una función recibe entradas inválidas o precondiciones insatisfechas
- **THEN** la función retorna inmediatamente al inicio sin envolver el cuerpo principal en bloques `else` anidados

### Requirement: Seguridad Estricta de Tipos y Eliminación de Casts Inseguros
El código fuente de Next.js y los tipos de sesión SHALL definir explícitamente todos los campos de usuario y negocio en las interfaces de TypeScript, prohibiendo el uso de `as any` en la lectura y mutación de sesión y modelos de dominio.

#### Scenario: Acceso a propiedades de usuario en sesión
- **WHEN** un componente accede a `session.user.businessId`, `session.user.role` o `session.user.subscriptionPlan`
- **THEN** TypeScript infiere el tipo exacto sin requerir conversiones `(session.user as any)` ni producir advertencias del compilador

### Requirement: Garantía de Entrega de Alertas en Webhooks
El webhook de WhatsApp SHALL garantizar la persistencia de alertas para todos los mensajes entrantes válidos, resolviendo el usuario destinatario a través de la cita activa o, en su defecto, a través del usuario principal del negocio (`businessId`).

#### Scenario: Mensaje recibido sin cita previa
- **WHEN** un cliente envía un mensaje a la instancia de WhatsApp del negocio sin tener una cita registrada en la base de datos
- **THEN** el sistema recupera el usuario administrador del negocio y crea la alerta en su bandeja de entrada

### Requirement: Indexación Compuesta y Eficiencia en Consultas SQL
Todas las consultas de lectura y filtrado sobre entidades multitenant SHALL ejecutarse mediante índices de base de datos compuestos que incluyan `businessId` y el campo de filtro o clasificación correspondiente (`appointmentDate`, `phone`, `email`, `status`).

#### Scenario: Consulta de citas por rango de fechas
- **WHEN** el backend consulta citas de un negocio para un día o semana específica
- **THEN** PostgreSQL utiliza el índice compuesto `(businessId, appointmentDate)` realizando un Index Scan sin incurrir en lecturas secuenciales de tabla

### Requirement: Certificación de Estándares de Código y Especificación
Toda la base de código de Volta SHALL superar auditorías estáticas de tipos (`tsc --noEmit`), validación estructural de OpenSpec y revisión de buenas prácticas de React 19 y Next.js.

#### Scenario: Validación de pipeline de integración
- **WHEN** se ejecuta la suite de validación completa del proyecto
- **THEN** todas las especificaciones de OpenSpec pasan con 0 incidentes y TypeScript compila con 0 errores

### Requirement: Descomposición Modular de la Gestión de Clientes
El panel de clientes SHALL desacoplar la lógica de filtrado, paginación y mutaciones en un custom hook reutilizable (`useClientsList`), organizando la presentación en componentes especializados dentro de `frontend/components/clients/`.

#### Scenario: Visualización y filtrado de clientes
- **WHEN** un usuario busca un cliente o filtra por estado LOPD
- **THEN** la lógica de filtrado normalizado se ejecuta mediante el hook modular, y la tabla de clientes se actualiza sin recargar el componente de página

### Requirement: Capa Centralizada de Cliente HTTP Tipado
El frontend SHALL canalizar las peticiones de red hacia el backend mediante la instancia de `apiClient` (`frontend/lib/apiClient.ts`), proporcionando tipado estricto, serialización automática y propagación de errores estandarizada.

#### Scenario: Petición de datos de clientes o citas
- **WHEN** un hook o vista solicita recursos al backend (ej. `apiClient.get<ClientItem[]>('/clients')`)
- **THEN** la respuesta se deserializa de forma segura y devuelve `{ data, error, status }` sin necesidad de envoltorios `fetch` manuales
