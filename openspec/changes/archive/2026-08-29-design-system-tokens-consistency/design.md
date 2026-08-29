## Context

El sistema de diseño de Volta cuenta con tokens semánticos definidos en Tailwind CSS 4 y CSS variables dinámicas (`--color-primary`, `--color-surface`, `--radius-scale`). Es fundamental asegurar que todos los componentes, modales y tablas respeten estos tokens de manera estricta.

## Goals / Non-Goals

**Goals:**
- Auditar y verificar que ningún componente utilice `<button>` nativo para acciones estándar, canalizando todo a través de `<Button>`.
- Garantizar que las clases de fondo y borde usen `bg-surface`, `bg-surface-container-*` y `border-outline-variant`.
- Verificar compatibilidad de modo oscuro en componentes clave (`MetricCard`, `Sidebar`, `PersonalizationSection`, `CalendarMonthView`, `CalendarWeekView`, `CalendarDayView`, `CalendarListView`).

**Non-Goals:**
- No alterar las paletas de color disponibles ni romper la compatibilidad con el backend.

## Decisions

1. **Tokens de Superficie de Tres Capas**:
   - `bg-surface`: Fondo principal de la vista.
   - `bg-surface-container-low` / `bg-surface-container-lowest`: Tarjetas y paneles elevados.
   - `bg-surface-container-high`: Elementos interactivos sobrevolados (hover) y badges.
2. **Botones e Inputs**:
   - Centralizar todas las variantes en `components/ui/button.tsx` y `components/ui/input.tsx`.

## Risks / Trade-offs

- **[Inconsistencias en modo oscuro]** → Mitigado mediante el uso de tokens semánticos que invierten automáticamente su luminosidad en `.dark`.
