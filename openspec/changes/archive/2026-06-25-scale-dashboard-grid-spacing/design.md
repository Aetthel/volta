## Context

Ajuste del espaciado del dashboard para usar los tokens del sistema de diseño de forma homogénea.

## Goals / Non-Goals

**Goals:**

- Unificar la separación vertical (`margin-bottom`) y horizontal (`gap`) entre todos los bloques y tarjetas del dashboard a exactamente `1.5rem` (`24px`).
- Usar el token semántico `gutter` en lugar de valores fijos de Tailwind (`gap-6`, `mb-8`, etc.) para permitir escalabilidad futura en caso de cambios en el sistema de diseño.

## Decisions

- **Uso exclusivo de gutter en el Layout:**
  - El saludo (Header Action Section) usará `mb-gutter`.
  - La rejilla de MetricCards usará `gap-gutter mb-gutter`.
  - La rejilla principal (Main Dashboard Widgets Row) usará `gap-gutter`.
  - Los contenedores internos flex de citas y widgets usarán `gap-gutter`.
- Esto alinea la interfaz en un patrón de cuadrícula matemática homogénea de `24px` tanto en el eje X como en el eje Y.
