## 1. Declaraciones y Aumento de Módulos NextAuth

- [x] 1.1 Asegurar que `frontend/types/next-auth.d.ts` declare estrictamente todas las propiedades de `User`, `Session['user']` y `JWT`
- [x] 1.2 Limpiar `frontend/auth.config.ts` eliminando todos los `(user as any)` y `(session.user as any)`

## 2. Limpieza de Casts en Componentes y Páginas

- [x] 2.1 Limpiar `frontend/components/Sidebar.tsx` eliminando casts `(session?.user as any)`
- [x] 2.2 Limpiar `frontend/app/(landing)/page.tsx` y `frontend/proxy.ts` eliminando casts `as any`
- [x] 2.3 Limpiar `frontend/app/(dashboard)/ajustes/page.tsx` eliminando `as any` en inicialización de perfil

## 3. Verificación y Compilación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar que `openspec validate` pase con 100% de éxito
