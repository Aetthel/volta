## 1. Implementación de Nuevos Componentes Atómicos en volta-ui.tsx

- [x] 1.1 Implementar el componente unificado `<Select />` con soporte de `React.forwardRef` e icono personalizado en `frontend/components/ui/volta-ui.tsx`.
- [x] 1.2 Implementar el componente unificado `<Textarea />` con soporte de `React.forwardRef` y estilos coherentes en `frontend/components/ui/volta-ui.tsx`.
- [x] 1.3 Implementar el componente animado `<Skeleton />` usando la clase pulse en `frontend/components/ui/volta-ui.tsx`.
- [x] 1.4 Implementar el componente reutilizable `<EmptyState />` con soporte para icono de Lucide, descripción y botón de acción en `frontend/components/ui/volta-ui.tsx`.

## 2. Refactorización de Formularios en Modales

- [x] 2.1 Reemplazar selectores y áreas de texto nativas en `frontend/components/AddClientModal.tsx` por los componentes `<Select />` y `<Textarea />`.
- [x] 2.2 Reemplazar selectores y áreas de texto nativas en `frontend/components/AddServiceModal.tsx` por los componentes `<Select />` y `<Textarea />`.
- [x] 2.3 Reemplazar selectores nativos en `frontend/components/NewAppointmentModal.tsx` por el componente `<Select />`.

## 3. Estandarización de Contenedores a Card

- [x] 3.1 Refactorizar la tabla principal de base de datos de clientes en `frontend/app/clientes/page.tsx` para usar la estructura de `<Card />`.
- [x] 3.2 Refactorizar el contenedor de calendario en `frontend/app/inicio/page.tsx` para usar la estructura de `<Card />`.
- [x] 3.3 Refactorizar los listados y diálogos manuales en `frontend/app/sedes/page.tsx` para usar la estructura de `<Card />`.
- [x] 3.4 Refactorizar el contenedor base en `frontend/components/MetricCard.tsx` para usar la estructura de `<Card />`.

## 4. Limpieza Tipográfica e Integración

- [x] 4.1 Corregir el conflicto de pesos tipográficos (`font-medium` y `font-semibold` concurrentes) en la visualización del horario en `frontend/app/ajustes/page.tsx`.
- [x] 4.2 Reemplazar indicadores de carga genéricos con `<Skeleton />` o spinners unificados en `frontend/app/ajustes/page.tsx` y otras vistas.
- [x] 4.3 Ejecutar el comando de validación `npm run build` en el workspace `frontend` para comprobar que no existan errores de tipado o compilación.
