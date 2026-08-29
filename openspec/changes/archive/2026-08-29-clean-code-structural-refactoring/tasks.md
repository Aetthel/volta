## 1. Extracción de Custom Hooks de Calendario

- [x] 1.1 Crear hook `useCalendarNavigation` en `frontend/lib/hooks/useCalendarNavigation.ts` y desacoplar la lógica de fechas
- [x] 1.2 Crear hook `useCalendarFilters` en `frontend/lib/hooks/useCalendarFilters.ts` y desacoplar filtrado de tags, colores y texto

## 2. Descomposición Modular de EventManager

- [x] 2.1 Extraer `CalendarHeader` con controles de vista y navegación en `frontend/components/calendar/CalendarHeader.tsx`
- [x] 2.2 Extraer las vistas `CalendarMonthView`, `CalendarWeekView`, `CalendarDayView` y `CalendarListView` en `frontend/components/calendar/`
- [x] 2.3 Refactorizar `EventManager.tsx` integrando los submódulos y hooks reduciendo su tamaño a menos de 400 líneas

## 3. Simplificación con Guard Clauses y DRY

- [x] 3.1 Aplicar retornos tempranos y aplanar condiciones complejas en controladores backend (`backend/src/controllers/`)
- [x] 3.2 Eliminar código duplicado de utilidades de fecha y formato centralizándolas en `lib/utils.ts`

## 4. Verificación y Compilación

- [x] 4.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y asegurar 0 errores
- [x] 4.2 Verificar funcionamiento en vivo de todas las vistas del calendario en el dashboard
