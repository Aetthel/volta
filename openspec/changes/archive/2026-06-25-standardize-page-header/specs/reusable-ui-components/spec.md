## ADDED Requirements

### Requirement: Componente PageHeader para cabeceras de página

El sistema SHALL proporcionar un componente de cabecera de página reutilizable (`PageHeader`) en `volta-ui.tsx` que unifique visualmente el título de la página, la descripción de soporte y las llamadas a la acción en la parte superior derecha de las vistas principales de la aplicación.

#### Scenario: Renderizar PageHeader completo en vista de clientes

- **WHEN** la página de clientes se monta e instancia `PageHeader` con título "Gestión de Clientes", descripción y los botones "Exportar" y "Añadir Cliente"
- **THEN** el sistema renderiza el título en el margen izquierdo con fuente `font-display` y tamaño `text-headline-lg` en peso semibold, y los botones alineados a la derecha de manera responsiva.
