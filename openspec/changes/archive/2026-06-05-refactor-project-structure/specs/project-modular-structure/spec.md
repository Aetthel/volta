## ADDED Requirements

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