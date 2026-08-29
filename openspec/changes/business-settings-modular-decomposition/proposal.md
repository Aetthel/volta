## Why

`frontend/components/settings/BusinessSection.tsx` ha crecido hasta 983 líneas concentrando la configuración general del negocio, la edición de enlace y QR público de reservas, la tabla de horarios de apertura por día y el catálogo CRUD completo de servicios. Modularizar esta vista en subcomponentes dedicados mejorará la legibilidad y facilitará futuras extensiones en el panel de administración.

## What Changes

- **Descomposición de `BusinessSection.tsx` en Submódulos**:
  - `components/settings/business/BusinessGeneralForm.tsx`: Datos del negocio, logo, enlace público de reservas y descarga de QR.
  - `components/settings/business/BusinessHoursGrid.tsx`: Matriz de horarios comerciales de Lunes a Domingo con toggles de apertura/cierre.
  - `components/settings/business/BusinessServicesCatalog.tsx`: Catálogo CRUD de servicios con buscador, precios, duraciones, etiquetas de color y modal de edición.
- **Orquestación Limpia**: Reducir `BusinessSection.tsx` a un orquestador conciso (< 120 líneas).

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `business-settings`: Desacoplamiento modular de subformularios de configuración del negocio.

## Impact

- **Frontend**: `frontend/components/settings/BusinessSection.tsx`, `frontend/components/settings/business/`.
- **Mantenibilidad**: Reducción de 983 líneas a submódulos especializados sin impacto en contratos de API.
