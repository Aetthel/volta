## ADDED Requirements

### Requirement: Modularización de Gestión Multi-Sede
El panel de administración multi-sede SHALL organizar la visualización, creación y gestión de trabajadores por sede a través del hook `useLocationsList` y componentes modulares bajo `frontend/components/sedes/`.

#### Scenario: Creación de sede y gestión de trabajadores
- **WHEN** un administrador añade una nueva sede o gestiona los trabajadores adscritos a un establecimiento
- **THEN** las operaciones se canalizan a través de `apiClient` y los modales modulares gestionan su estado de forma autónoma
