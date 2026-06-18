## Why

La base de código del frontend de Volta contiene inconsistencias de diseño y de componentes. Hay inputs, selectores, áreas de texto y estructuras de tarjetas (Cards) maquetados de forma manual y duplicados en distintas vistas (como clientes, inicio, sedes y ajustes). Esto dificulta el mantenimiento del diseño "Clinical Elegance" y rompe la consistencia visual. Estandarizar estos controles y añadir los componentes faltantes de carga (Skeleton) y estados vacíos (EmptyState) mejorará la experiencia de usuario y la mantenibilidad del código.

## What Changes

- **Componentes comunes de formulario**: Agregar los componentes unificados `<Select />` y `<Textarea />` en `volta-ui.tsx` para evitar que cada formulario defina clases CSS ad-hoc.
- **Visuales de carga y estado vacío**: Implementar `<Skeleton />` (para estados de carga con efectos de animación pulse) y `<EmptyState />` (para estados sin datos con soporte de icono y llamada a la acción) en `volta-ui.tsx`.
- **Estandarización de Tarjetas (Cards)**: Refactorizar layouts de contenedores de tarjetas manuales para que utilicen la composición unificada de `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>` y `<CardFooter>`.
- **Limpieza Tipográfica**: Resolver conflictos de clases CSS tipográficas (como el uso simultáneo de `font-medium` y `font-semibold`) en `ajustes/page.tsx`.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `reusable-ui-components`: Estandarizar la interfaz de usuario de formularios, tarjetas de datos, layouts modales comunes y estados de carga o sin datos.

## Impact

- `frontend/components/ui/volta-ui.tsx` (nuevos componentes de UI).
- `frontend/components/AddClientModal.tsx` (reemplazo de select/textarea y layout).
- `frontend/components/AddServiceModal.tsx` (reemplazo de select/textarea y layout).
- `frontend/components/NewAppointmentModal.tsx` (reemplazo de select/textarea y layout).
- `frontend/components/MetricCard.tsx` (reemplazo del layout de tarjeta manual).
- `frontend/app/clientes/page.tsx` (reemplazo de tabla/sección por Card).
- `frontend/app/inicio/page.tsx` (reemplazo del contenedor de calendario por Card).
- `frontend/app/sedes/page.tsx` (reemplazo de tarjetas de sedes y diálogos manuales por Card).
- `frontend/app/ajustes/page.tsx` (resolución de clases tipográficas conflictivas).
