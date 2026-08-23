## Context

El frontend de Volta en Next.js App Router contiene componentes complejos en `frontend/components` y `frontend/app`. Actualmente, lógica de estados de UI, validaciones de formularios y llamadas a API coinciden dentro del cuerpo de los componentes React.

Esta propuesta aplica las pautas de la skill `code-refactor` para estructurar el frontend en capas claras (Presentación vs Lógica de Negocio en Custom Hooks) mejorando la mantenibilidad, legibilidad y facilidad de prueba sin modificar la apariencia visual ni las funcionalidades para el usuario final.

## Goals / Non-Goals

**Goals:**
- Desacoplar la lógica de estado y mutación de los modales principales (`AddClientModal`, `AddServiceModal`, `NewAppointmentModal`, etc.) hacia custom hooks en `frontend/hooks/`.
- Aplicar retornos tempranos y simplificación de condicionales en manejadores de eventos.
- Eliminar imports no utilizados, comentarios innecesarios y tipos `any`.
- Mantener compatibilidad 100% con los componentes existentes y pruebas existentes.

**Non-Goals:**
- Modificar el diseño UI / UX o la paleta visual de la interfaz.
- Reescritura del backend o cambios en los schemas de Base de Datos.

## Decisions

### Decision 1: Extracción de Custom Hooks por Dominio
- **Opción Elegida**: Crear hooks reutilizables por dominio en `frontend/hooks/` (ej. `useAddClient`, `useAddService`, `useAppointmentManager`).
- **Alternativa Considerada**: Dejar la lógica en componentes y solo separar en subcomponentes.
- **Razón**: Los custom hooks permiten probar la lógica de negocio aislada sin renderizar UI y reducen la longitud de las funciones de componentes a menos de 50 líneas.

### Decision 2: Refactorización Progresiva por Componente
- **Opción Elegida**: Refactorizar de forma incremental componente por componente comprobando la compilación en cada iteración.
- **Alternativa Considerada**: Reestructurar todos los archivos en un solo pase.
- **Razón**: Minimiza el riesgo de regresiones y facilita la revisión de cambios atomizados.

## Risks / Trade-offs

- [Riesgo] Interrupción inadvertida del comportamiento de formularios complejos durante la extracción de hooks.
  → *Mitigación*: Ejecutar la suite de tests existente (`pnpm test` / `vitest`) tras la refactorización de cada módulo.
