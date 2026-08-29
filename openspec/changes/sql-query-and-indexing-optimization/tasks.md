## 1. Auditoría de Esquema Prisma e Índices

- [x] 1.1 Validar índices compuestos en `Appointment`, `Client`, `User`, `Service` y `Alert` en `backend/prisma/schema.prisma`
- [x] 1.2 Verificar eliminación de N+1 en `appointmentsService.js` y `clientsService.js`

## 2. Validación de Compilación y OpenSpec

- [x] 2.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y asegurar 0 errores
- [x] 2.2 Validar OpenSpec con `openspec validate`
