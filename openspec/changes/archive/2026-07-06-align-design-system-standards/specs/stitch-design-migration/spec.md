## MODIFIED Requirements

### Requirement: Estandarizar diseño de pantallas

El sistema SHALL implementar las vistas de Iniciar Sesión, Dashboard/Calendario, Clientes, Sedes, Ajustes y Admin Global Stats en Next.js utilizando Tailwind CSS puro y siguiendo las pautas de diseño "Clinical Elegance". Todos los espaciados, márgenes y gaps de contenedores principales de layouts en estas vistas SHALL utilizar la variable `--spacing-gutter` (`gutter`) para garantizar consistencia visual y reescalado fluido en todas las resoluciones. Todos los colores de texto, fondos y bordes en estas vistas SHALL adecuarse estrictamente a los tokens de color del tema definidos en `DESIGN.md` (como `primary`, `secondary`, `error`, `surface`, etc.), prohibiéndose el uso de clases de color hardcodeadas.

#### Scenario: Visualización responsiva de páginas

- **WHEN** el usuario accede a cualquier ruta principal (ej. `/dashboard`, `/clientes`, `/sedes`, `/ajustes`, `/admin`) en pantalla de escritorio o móvil
- **THEN** la aplicación se renderiza de forma responsiva adaptándose al tamaño de la pantalla, con un tamaño de fuente base de 18px, pesos tipográficos ligeros/medianos, y un espaciado externo e interno controlado dinámicamente por la variable `--spacing-gutter`.

#### Scenario: Flujo de redirección desde Inicio de Sesión

- **WHEN** el usuario introduce credenciales en la ruta `/login` y envía el formulario
- **THEN** el sistema redirige al usuario a la ruta `/dashboard` tras simular la carga

#### Scenario: Consistencia de colores del tema en Clientes

- **WHEN** el usuario interactúa con la página de `/clientes` y activa acciones de WhatsApp o revisa estados LOPD
- **THEN** todos los iconos de WhatsApp se muestran en color primario (`text-primary`), el estado LOPD Aceptado en color primario (`text-primary`), el estado LOPD Pendiente en color de error (`text-error`), y los banners Toast integran la combinación de colores de contenedor secundario (`bg-secondary-container`, `text-on-secondary-container`) sin colores hardcodeados de verde o ámbar.

#### Scenario: Consistencia de colores del tema en Inicio, Agenda y Ajustes

- **WHEN** el usuario navega a las secciones de Inicio, Agenda o Ajustes
- **THEN** todos los fondos de iconos de métricas de inicio se muestran en contenedores secundarios del tema (`bg-secondary-container/30`), todos los iconos en color primario (`text-primary`), y los textos e iconos de alertas/estados en toda la app se mapean exclusivamente a colores del tema (`primary`, `error`, `on-surface`, `on-surface-variant`, etc.), eliminando cualquier color Tailwind como `slate`, `emerald`, `amber` o código hexadecimal duro.

#### Scenario: Armonización de colores primarios y containers

- **WHEN** la aplicación carga las hojas de estilo globales y lee las propiedades personalizadas en `globals.css`
- **THEN** los colores primarios corporativos de Teal se sincronizan exactamente con las especificaciones de `DESIGN.md`, utilizando `#006565` para el color primario de marca (`primary`) y `#008080` para el contenedor primario (`primary-container`).
