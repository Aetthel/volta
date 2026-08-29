## ADDED Requirements

### Requirement: Descomposición Atómica de Volta UI
El sistema de diseño Volta UI SHALL organizar cada componente visual en archivos individuales dentro de `frontend/components/ui/`, exponiendo un barrel file unificado en `volta-ui.tsx` para compatibilidad completa hacia atrás.

#### Scenario: Importación atómica y unificada
- **WHEN** un desarrollador importa componentes desde `volta-ui.tsx` o desde sus archivos individuales (`card.tsx`, `alert.tsx`, `field.tsx`)
- **THEN** los componentes se resuelven con idéntica API y contratos de tipos sin errores de empaquetado
