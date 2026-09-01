## 1. Auditoría y Estandarización de Tokens y CSS

- [x] 1.1 Revisar y asegurar las definiciones de `@theme` en `frontend/app/globals.css` para todas las variantes de radio y tipografía
- [x] 1.2 Auditar `frontend/lib/theme.ts` para soportar las escalas `FONT_SCALES` y `RADIUS_SCALES`
- [x] 1.3 Asegurar script inline o inicializador de tema en `frontend/app/layout.tsx` para aplicar `--font-scale`, `--radius-scale` y colores sin FOUC

## 2. Armonización de Componentes de UI

- [x] 2.1 Auditar y estandarizar `frontend/components/ui/` (`button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `dropdown-menu.tsx`, etc.) para consumir las clases de escala dinámica
- [x] 2.2 Auditar vistas principales (`clientes`, `equipo`, `agenda`, `inicio`, `sedes`, `ajustes`) asegurando jerarquía tipográfica uniforme

## 3. Verificación y Validación

- [x] 3.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y confirmar 0 errores
- [x] 3.2 Validar OpenSpec con `openspec validate --all`
