## ADDED Requirements

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
