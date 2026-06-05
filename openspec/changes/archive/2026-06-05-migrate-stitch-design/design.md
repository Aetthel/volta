## Context

El proyecto Volta actualmente cuenta con exportaciones estáticas en HTML del diseño "Stitch" en la carpeta `docs/stitch_dashboard_y_calendario`. Necesitamos pasar este diseño a una estructura de frontend modular en Next.js (App Router) bajo la carpeta `frontend/`, implementando componentes reutilizables y limpios en base a las directrices de diseño "Clinical Elegance".

## Goals / Non-Goals

**Goals:**
* Centralizar las variables del sistema de diseño en `globals.css` utilizando Tailwind CSS v4.
* Reemplazar los iconos de Material Symbols por iconos vectoriales SVG limpios utilizando `lucide-react`.
* Desarrollar componentes modulares reutilizables para Sidebar, BottomNav, Header, MetricCard y Modales.
* Crear las páginas `/login`, `/dashboard`, `/clientes`, `/sedes`, `/ajustes` y `/admin` con interactividad simulada mediante datos locales (`useState`).

**Non-Goals:**
* Conexión en esta fase con base de datos Prisma/PostgreSQL o rutas del backend.
* Integración del sistema real de emparejamiento de WhatsApp o mensajería real (se implementará como estados simulados en la UI).

## Decisions

* **Decisión 1: Tailwind CSS puro sin dependencias de componentes**: En lugar de utilizar componentes pesados de shadcn/ui, se escribe CSS semántico y reutilizable mediante clases de Tailwind v4 y componentes funcionales sencillos de React. Esto optimiza el rendimiento y otorga control total sobre el diseño.
* **Decisión 2: Lucide React para Iconos**: Se eligen los iconos de Lucide sobre Material Symbols Outlined para lograr una mejor consistencia técnica en React y no sobrecargar el navegador con llamadas HTTP externas a fuentes externas de Google.
* **Decisión 3: Simulación de Estado de Datos**: Las listas de citas, sedes y clientes se controlan localmente con el estado de React (`useState`), permitiendo demostrar la interactividad (búsqueda, eliminación y inserción de registros en modales) sin necesidad de endpoints de API reales en esta etapa.

## Risks / Trade-offs

* **Riesgo 1**: Pérdida de estado al recargar la página.
* **Mitigación**: Aceptable para la fase actual de UX/UI. Cuando se requiera, estas variables de estado se conectarán fácilmente con Fetch/Axios a la base de datos a través de Prisma.
