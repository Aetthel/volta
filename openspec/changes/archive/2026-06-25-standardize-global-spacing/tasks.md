## 1. Configuración Global de Espaciado

- [x] 1.1 Configurar `--spacing-gutter` en `@theme` dentro de [globals.css](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/globals.css) usando `clamp(1rem, 0.75rem + 1.25vw, 1.5rem)`.

## 2. Refactorización de Páginas y Layouts

- [x] 2.1 Modificar [clientes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/clientes/page.tsx) para sustituir `p-margin-mobile md:p-gutter` y márgenes/gaps estáticos por `p-gutter` y `gap-gutter`.
- [x] 2.2 Modificar [sedes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/sedes/page.tsx) para sustituir `p-margin-mobile md:p-gutter` y márgenes/gaps estáticos por `p-gutter` y `gap-gutter`.
- [x] 2.3 Modificar [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx) para sustituir `p-margin-mobile md:p-gutter` y márgenes/gaps estáticos por `p-gutter` y `gap-gutter` en todos los contenedores de secciones y formularios.
- [x] 2.4 Modificar [admin/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/admin/page.tsx) para sustituir `p-margin-mobile md:p-gutter` y márgenes/gaps estáticos por `p-gutter` y `gap-gutter`.
- [x] 2.5 Modificar [agenda/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/agenda/page.tsx) para unificar la separación entre la cabecera y el calendario al token `gutter`.

## 3. Validación y Control de Calidad

- [x] 3.1 Probar la responsividad en el simulador de navegador (320px, 768px, 1024px y superior) para validar la suavidad de la transición del espaciado.
- [x] 3.2 Verificar que el proyecto compila y no se introducen errores de TypeScript ni de CSS.
