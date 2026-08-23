## ADDED Requirements

### Requirement: Carga Diferida de Modales (Code Splitting)
Los componentes modales pesados que no son visibles en el primer renderizado inicial de la página DEBEN cargarse dinámicamente usando `next/dynamic` solo cuando se requiera su apertura.

#### Scenario: Apertura de modal en la Agenda
- **WHEN** el usuario hace clic por primera vez en "Reservar Cita" o "Añadir Cliente"
- **THEN** el navegador descarga el bundle del modal de forma asíncrona sin bloquear la carga inicial de la página

### Requirement: Captura de Errores en UI con Error Boundaries
Todas las rutas principales del Dashboard DEBEN incluir un archivo `error.tsx` para capturar fallos de renderizado o peticiones de API fallidas.

#### Scenario: Fallo de red al cargar subruta
- **WHEN** ocurre un error no capturado en una vista del Dashboard
- **THEN** la UI muestra una vista alternativa (*Error Boundary*) con un botón para reintentar la operación sin recargar toda la página
