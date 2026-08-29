## Why

`frontend/components/ui/volta-ui.tsx` acumula 1.374 líneas que agrupan más de una docena de componentes UI no relacionados (`Field`, `Card`, `Badge`, `Avatar`, `FloatingInput`, `Combobox`, `SegmentedControl`, `Tabs`, `Alert`, `Empty`, `DatePicker`, `TimePicker`). Modularizar cada componente en su propio archivo atómico dentro de `frontend/components/ui/` y transformar `volta-ui.tsx` en un barrel file aumentará la mantenibilidad, mejorará el tree-shaking del empaquetador y eliminará el monolito de UI.

## What Changes

- **Extracción de Componentes Atómicos**:
  - `components/ui/field.tsx`: `Field`, `FieldGroup`, `FieldLabel`, `FieldDescription`, `InputGroup`.
  - `components/ui/card.tsx`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - `components/ui/floating-input.tsx`: `FloatingInput`, `FloatingTextarea`.
  - `components/ui/combobox.tsx`: `Combobox`.
  - `components/ui/segmented-control.tsx`: `SegmentedControl`.
  - `components/ui/tabs.tsx`: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
  - `components/ui/alert.tsx`: `Alert`, `AlertTitle`, `AlertDescription`.
  - `components/ui/empty.tsx`: `Empty`.
  - `components/ui/date-picker.tsx`: `DatePicker`.
  - `components/ui/time-picker.tsx`: `TimePicker`.
- **Re-exportación en `volta-ui.tsx`**: Mantener compatibilidad absoluta hacia atrás re-exportando todos los componentes desde `volta-ui.tsx`.

## Capabilities

### New Capabilities
<!-- No new functional capabilities -->

### Modified Capabilities
- `reusable-ui-components`: Estructuración atómica de componentes de diseño Volta UI.

## Impact

- **UI System**: `frontend/components/ui/`.
- **Compatibilidad**: 100% retrocompatible sin romper ninguna importación en el proyecto.
