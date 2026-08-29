## ADDED Requirements

### Requirement: Modularización de Secciones de Configuración del Negocio
La sección de configuración del negocio SHALL organizar su interfaz en submódulos especializados (`BusinessGeneralForm`, `BusinessHoursGrid`, `BusinessServicesCatalog`), manteniendo la sincronización reactiva de estado y persistencia hacia el backend.

#### Scenario: Edición y guardado de horarios y servicios
- **WHEN** el administrador modifica los horarios de apertura o actualiza el catálogo de servicios
- **THEN** cada submódulo gestiona su estado local de guardado y emite feedback visual mediante toasts sin alterar los otros bloques
