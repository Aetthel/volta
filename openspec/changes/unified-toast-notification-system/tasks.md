## 1. Instalación y Creación del Módulo Toaster en Volta UI

- [x] 1.1 Instalar la dependencia `sonner` en `frontend` y verificar su correcta adición en `frontend/package.json`.
- [x] 1.2 Implementar `frontend/components/ui/sonner.tsx` integrando el componente `<Toaster />` con clases adaptadas a los tokens de diseño de Volta UI (`bg-surface-container-lowest`, `border-outline-variant`, esquinas `rounded-xl`, tipografía `font-sans`) e implementar la extensión `toast.whatsapp({ phone, message, title })`.
- [x] 1.3 Exportar `Toaster` y `toast` en `frontend/components/ui/volta-ui.tsx` e integrar `<Toaster />` dentro de `frontend/components/Providers.tsx`, verificando el renderizado global.

## 2. Migración de Agenda y Equipo

- [x] 2.1 Refactorizar `frontend/app/(dashboard)/agenda/page.tsx` para eliminar el toast ad-hoc inferior (`bottom-6 right-6`), sustituyéndolo por llamadas declarativas a `toast.success` y `toast.error`.
- [x] 2.2 Refactorizar `frontend/app/(dashboard)/equipo/page.tsx` y `frontend/lib/hooks/useTeamList.ts` para eliminar el contenedor flotante `<Alert>`, suprimir los `window.alert()` nativos y reemplazarlos por `toast.success` y `toast.error`.

## 3. Migración de Clientes, Modales e Inicio

- [x] 3.1 Refactorizar `frontend/app/(dashboard)/clientes/page.tsx` y `frontend/lib/hooks/useClientsList.ts` para suprimir los dos componentes `<Alert>` flotantes en `top-6 right-6`, eliminar los `alert()` nativos y unificar los mensajes con `toast.success`, `toast.error` y `toast.whatsapp`.
- [x] 3.2 Refactorizar `frontend/components/NewAppointmentModal.tsx` para eliminar el `<Alert>` de consentimiento LOPD flotante y usar `toast.whatsapp`.
- [x] 3.3 Añadir feedback toast en `frontend/app/(dashboard)/inicio/page.tsx` al guardar citas y clientes con éxito, evitando cierres de modal silenciosos.

## 4. Limpieza de Ajustes y Eliminación de Toast Legacy

- [x] 4.1 Eliminar el prop drilling de `setToast` en `frontend/app/(dashboard)/ajustes/page.tsx` y en todos sus subcomponentes (`BusinessSection`, `ProfileSection`, `MessagesSection`, `BillingSection`, `BusinessHoursGrid`, `BusinessHolidaysGrid`, etc.), consumiendo directamente `toast.*`.
- [x] 4.2 Eliminar el componente obsoleto `frontend/components/settings/Toast.tsx` y actualizar los tests de ajustes (`BusinessScheduleCard.test.tsx`) para verificar compatibilidad.

## 5. Verificación Integral y Calidad

- [x] 5.1 Ejecutar `pnpm --filter frontend typecheck` y `pnpm --filter backend typecheck` asegurando cero errores de compilación TypeScript.
- [x] 5.2 Ejecutar `pnpm lint` asegurando que ESLint valide sin advertencias ni errores.
- [x] 5.3 Ejecutar toda la suite de tests con `pnpm test` verificando que los 41 archivos de test y más de 350 pruebas pasen limpiamente.
