## MODIFIED Requirements

### Requirement: Skip mock seeding in production
The database initialization routine SHALL NOT seed any mock/demonstration clients, appointments, or users during the application bootstrap phase, regardless of the environment.

#### Scenario: Running in any environment
- **WHEN** the backend application starts in either production or development environment
- **THEN** no mock users, businesses, clients, or appointments are automatically created in the database
