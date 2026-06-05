# stitch-design-migration Specification

## Purpose
TBD - created by archiving change migrate-stitch-design. Update Purpose after archive.
## Requirements
### Requirement: Estandarizar diseño de pantallas
El sistema SHALL implementar las vistas de Iniciar Sesión, Dashboard/Calendario, Clientes, Sedes, Ajustes y Admin Global Stats en Next.js utilizando Tailwind CSS puro y siguiendo las pautas de diseño "Clinical Elegance".

#### Scenario: Visualización responsiva de páginas
- **WHEN** el usuario accede a cualquier ruta principal (ej. `/dashboard`, `/clientes`, `/sedes`, `/ajustes`, `/admin`) en pantalla de escritorio o móvil
- **THEN** la aplicación se renderiza de forma responsiva adaptándose al tamaño de la pantalla, con un tamaño de fuente base de 18px y pesos tipográficos ligeros/medianos

#### Scenario: Flujo de redirección desde Inicio de Sesión
- **WHEN** el usuario introduce credenciales en la ruta `/login` y envía el formulario
- **THEN** el sistema redirige al usuario a la ruta `/dashboard` tras simular la carga

