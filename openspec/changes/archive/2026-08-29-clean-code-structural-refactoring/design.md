## Context

`EventManager.tsx` actualmente supera las 1.800 líneas de código y contiene múltiples responsabilidades entremezcladas: navegación temporal (mes, semana, día), lógica de arrastrar y soltar (drag & drop), filtrado reactivo por tags/colores/búsqueda, manipulación modal de creación/edición de citas, y maquetación de cuatro vistas de cuadrícula diferentes.

## Goals / Non-Goals

**Goals:**
- Descomponer la lógica del calendario en custom hooks reutilizables (`useCalendarNavigation`, `useCalendarFilters`, `useCalendarEvents`).
- Extraer subcomponentes de vista limpios (`CalendarMonthView`, `CalendarWeekView`, `CalendarDayView`, `CalendarListView`, `EventEditModal`).
- Aplicar guard clauses y early returns en controladores y funciones para reducir la complejidad ciclomática.
- Preservar al 100% el comportamiento funcional, los eventos de arrastre y la sincronización en tiempo real.

**Non-Goals:**
- No alterar las APIs de backend ni los esquemas de base de datos.
- No modificar el diseño visual externo ni las interacciones del usuario.

## Decisions

1. **Estructura Modular para el Calendario**:
   - Crear el directorio `frontend/components/calendar/` para alojar los submódulos especializados.
   - Mantener `EventManager.tsx` como el orquestador principal de alto nivel y punto de exportación compatible con el resto del proyecto.
2. **Encapsulamiento de Estado en Hooks**:
   - `useCalendarNavigation`: Manejo de fecha actual, cambio de vista (mes/semana/día/lista) y navegación adelante/atrás/hoy.
   - `useCalendarFilters`: Búsqueda de texto, filtros de etiquetas, colores y categorías.

## Risks / Trade-offs

- **[Regresión en Drag & Drop o Modales]** → Se mitiga manteniendo las mismas firmas de props e interfaces de TypeScript en cada submódulo extraído.
