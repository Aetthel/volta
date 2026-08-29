## Context

`frontend/components/ui/volta-ui.tsx` agrupaba 1.374 líneas de componentes atómicos. Separar cada componente mejora el árbol de dependencias y facilita la edición sin bloqueos.

## Goals / Non-Goals

**Goals:**
- Crear módulos atómicos individuales para cada componente de Volta UI.
- Mantener `volta-ui.tsx` como un punto central de exportación.

**Non-Goals:**
- No alterar estilos, variantes ni APIs de componentes.

## Decisions

1. **Estructura Atómica en `frontend/components/ui/`**:
   - `field.tsx`, `card.tsx`, `floating-input.tsx`, `combobox.tsx`, `segmented-control.tsx`, `tabs.tsx`, `alert.tsx`, `empty.tsx`, `date-picker.tsx`, `time-picker.tsx`.

## Risks / Trade-offs

- Ninguno. 100% retrocompatible.
