## ADDED Requirements

### Requirement: Rejilla Adaptable de Panel de Control
El layout del panel principal (`/inicio`) SHALL estructurarse mediante una rejilla responsiva basada en 10 columnas en pantallas medianas y grandes, distribuyéndose en una proporción de 6 columnas (60%) para el listado de citas y 4 columnas (40%) para la columna lateral de utilidades, colapsando a 1 columna en móviles.

#### Scenario: Visualización responsiva en tablets y ordenadores
- **WHEN** la aplicación se carga en una pantalla de tamaño tablet (ancho >= 768px) o de escritorio
- **THEN** el sistema renderiza la rejilla del panel de control alineada horizontalmente en proporción 6/4 (col-span-6 y col-span-4).
