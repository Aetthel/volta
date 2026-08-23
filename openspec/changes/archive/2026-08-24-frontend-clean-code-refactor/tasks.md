## 1. Extracción de Lógica y Custom Hooks

- [x] 1.1 Crear custom hooks para formularios principales (`useAddClientForm`, `useAddServiceForm`) en `frontend/hooks/`
- [x] 1.2 Extraer la lógica de negocio y mutación de `AddClientModal.tsx` al hook `useAddClientForm`
- [x] 1.3 Extraer la lógica de negocio y mutación de `AddServiceModal.tsx` al hook `useAddServiceForm`
- [x] 1.4 Extraer la gestión de citas de `NewAppointmentModal.tsx` / `EventManager.tsx` a custom hooks dedicados

## 2. Aplicación de Clean Code & Simplificación de Componentes

- [x] 2.1 Refactorizar condicionales anidados e implementar Guard Clauses en los manejadores de eventos de los modales refactorizados
- [x] 2.2 Eliminar código muerto (imports no utilizados, variables obsoletas y tipos `any`) en `frontend/components/`
- [x] 2.3 Formatear y documentar (únicamente razonamiento de decisiones no obvias) los componentes principales

## 3. Validación y Verificación

- [x] 3.1 Ejecutar el linter y verificar que no existan errores de compilación TypeScript
- [x] 3.2 Ejecutar las pruebas del frontend (`pnpm test`) para garantizar que la funcionalidad permanezca intacta
