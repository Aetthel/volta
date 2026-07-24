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
