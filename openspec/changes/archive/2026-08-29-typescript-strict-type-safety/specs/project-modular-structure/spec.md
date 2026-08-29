## ADDED Requirements

### Requirement: Seguridad Estricta de Tipos y Eliminación de Casts Inseguros
El código fuente de Next.js y los tipos de sesión SHALL definir explícitamente todos los campos de usuario y negocio en las interfaces de TypeScript, prohibiendo el uso de `as any` en la lectura y mutación de sesión y modelos de dominio.

#### Scenario: Acceso a propiedades de usuario en sesión
- **WHEN** un componente accede a `session.user.businessId`, `session.user.role` o `session.user.subscriptionPlan`
- **THEN** TypeScript infiere el tipo exacto sin requerir conversiones `(session.user as any)` ni producir advertencias del compilador
