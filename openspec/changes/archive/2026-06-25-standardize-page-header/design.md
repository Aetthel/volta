## Context

Actualmente, las cabeceras de cada página en Volta están codificadas de forma independiente, introduciendo pequeñas diferencias en clases de Tailwind (como `mb-6` frente a `mb-8`, variaciones en la estructura responsiva, estilos de fuentes, etc.). Estandarizaremos esta sección en un único componente reutilizable `PageHeader` en [volta-ui.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/ui/volta-ui.tsx) que garantice la consistencia visual y soporte de forma flexible botones o selectores.

## Goals / Non-Goals

**Goals:**

- Implementar el componente `PageHeader` en [volta-ui.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/ui/volta-ui.tsx).
- Estandarizar las vistas `/clientes`, `/sedes`, `/ajustes`, `/admin` e `/inicio` para utilizar `PageHeader`.
- Adaptar `/inicio` para remover la tarjeta con bordes y fondo que contenía el saludo, utilizando una cabecera de texto limpia idéntica al estilo de la foto.
- No renderizar ninguna cabecera de página en `/agenda`.

**Non-Goals:**

- Modificar el comportamiento de búsqueda en el componente `Header` (barra superior de búsqueda).
- Cambiar la lógica interna de los botones o formularios en las vistas principales.

## Decisions

### 1. Definición del Componente `PageHeader`

Agregaremos el componente a `volta-ui.tsx` con la siguiente firma:

```tsx
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}
```

- **Estilo visual:**
  - Layout: `flex flex-col md:flex-row md:items-end justify-between gap-gutter mb-gutter`. Esto alinea los botones a la derecha en escritorio y los apila debajo del título en móviles.
  - Título: `<h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">`
  - Descripción: `<p className="font-body-lg text-body-lg text-on-surface-variant font-medium">`
  - Contenedor de acciones: `<div className="flex items-center gap-2 shrink-0">`. Nota: En el diseño original de clientes, los botones estaban envueltos en `hidden md:flex`. Haremos que las acciones sean flexibles y visibles de forma responsiva.

### 2. Remoción del Card del saludo en `/inicio`

Modificaremos `/inicio` para que use el componente `PageHeader` directamente, removiendo el contenedor `<section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] mb-gutter">`.

- **Razón:** Sigue el diseño plano y limpio solicitado, reduciendo el ruido visual en la entrada del dashboard y homogenizando el estilo.

## Risks / Trade-offs

- **[Riesgo]** Las acciones en móvil podrían ocupar demasiado espacio si hay muchos botones.
  - _Mitigación:_ Limitar los botones en cabecera a máximo 2. Si se colapsa en móvil, se apilarán debajo del título gracias a `flex-col md:flex-row`.
- **[Riesgo]** Rediseño en agenda.
  - _Mitigación:_ Se validó que `/agenda` ya no tiene cabecera antes del Card, por lo que no realizaremos ningún cambio en esa página.

## Migration Plan

1. **Fase 1 (volta-ui.tsx):** Escribir y exportar `PageHeader`.
2. **Fase 2 (Clientes & Sedes):** Refactorizar `clientes/page.tsx` y `sedes/page.tsx` para usar `<PageHeader ... />`.
3. **Fase 3 (Ajustes):** Refactorizar las dos cabeceras en `ajustes/page.tsx` (para la configuración de perfil y la configuración de administrador global).
4. **Fase 4 (Admin & Inicio):**
   - Refactorizar `admin/page.tsx` pasando el dropdown de selección de rango como propiedad `actions`.
   - Refactorizar `inicio/page.tsx` removiendo la tarjeta contenedora y adaptando el saludo para consumir el nuevo `PageHeader`.
