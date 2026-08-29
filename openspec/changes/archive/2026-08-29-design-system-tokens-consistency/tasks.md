## 1. Auditoría de Tokens Semánticos y Colores

- [x] 1.1 Auditar y asegurar tokens semánticos en componentes de calendario (`CalendarHeader`, `EventCard`, `CalendarMonthView`, `CalendarWeekView`, `CalendarDayView`, `CalendarListView`)
- [x] 1.2 Auditar modales de creación (`AddClientModal`, `AddServiceModal`, `EventEditDialog`) verificando uso de tokens y radios dinámicos

## 2. Estandarización de Botones y Estados Interactivos

- [x] 2.1 Verificar que todos los botones usen `<Button>` con soporte de micro-interacciones (`active:scale-[0.98]`)
- [x] 2.2 Validar consistencia de estados hover, focus-visible y disabled en inputs y controles

## 3. Verificación de Modo Oscuro y Compilación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar que `openspec validate` pase con 100% de éxito
