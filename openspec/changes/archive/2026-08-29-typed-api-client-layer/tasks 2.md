## 1. Evolución del Cliente API Tipado

- [x] 1.1 Diseñar e implementar `frontend/lib/apiClient.ts` con tipado estricto, métodos de conveniencia y helpers de dominio

## 2. Refactorización de Hooks y Componentes a `apiClient`

- [x] 2.1 Migrar `frontend/lib/hooks/useClientsList.ts` a `apiClient`
- [x] 2.2 Migrar `frontend/lib/hooks/useTeamList.ts` a `apiClient`
- [x] 2.3 Migrar submódulos de ajustes (`BusinessGeneralForm`, `BusinessHoursGrid`, `BusinessServicesCatalog`, `WhatsAppConnectionCard`, `WhatsAppTemplatesEditor`, `ProfileSection`, `PersonalizationSection`) a `apiClient`

## 3. Verificación y Validación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar OpenSpec con `openspec validate`
