## Context

La base de código del frontend de Volta implementa controles de formularios (`<select>`, `<textarea>`) y contenedores de datos de manera inconsistente e ineficiente, escribiendo combinaciones manuales de Tailwind en cada modal o página. Esto produce inconsistencias visuales y dificulta la propagación de cambios de diseño (como bordes y estados de foco).

Para resolver esto, crearemos componentes unificados y reutilizables en `volta-ui.tsx` y refactorizaremos las pantallas principales.

## Goals / Non-Goals

**Goals:**
- Implementar los componentes atómicos `<Select />`, `<Textarea />`, `<Skeleton />` y `<EmptyState />` en `volta-ui.tsx` bajo los estándares del proyecto (Clinical Elegance, base 18px).
- Reemplazar todos los selectores y textareas nativos en los formularios modales (`AddClientModal`, `AddServiceModal`, `NewAppointmentModal`) con los nuevos componentes atómicos.
- Refactorizar las secciones contenedoras manuales en `clientes/page.tsx`, `inicio/page.tsx`, `sedes/page.tsx` y `MetricCard.tsx` para que utilicen la composición unificada de `<Card />`.
- Limpiar las clases tipográficas conflictivas redundantes en `ajustes/page.tsx`.

**Non-Goals:**
- No se migrarán a NextAuth otros mecanismos de autenticación ni se modificará el backend de la aplicación.
- No se agregará una biblioteca externa de componentes (como Radix o Shadcn original) si las necesidades pueden resolverse con clases estándar y componentes nativos envueltos en `volta-ui.tsx`.

## Decisions

### 1. API y firma de los nuevos componentes de formulario en `volta-ui.tsx`
- **Decisión**: Extender los tipos nativos de React (`React.SelectHTMLAttributes` y `React.TextareaHTMLAttributes`) para mantener compatibilidad total con react-hook-form y props estándar de React.
- **Detalle de Select**:
  ```tsx
  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ComponentType<any>;
  }
  ```
  Permite incluir un icono de Lucide en la parte izquierda, alineándose visualmente con `FloatingInput`.
- **Detalle de Textarea**:
  ```tsx
  export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextareaElement> {}
  ```
  Unifica las clases de borde, color de fondo, padding y estados de foco.

### 2. Creación del componente de visualización de carga `Skeleton`
- **Decisión**: Implementar un div animado básico utilizando la animación `animate-pulse` nativa de Tailwind:
  ```tsx
  export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("animate-pulse rounded bg-outline-variant/30", className)}
        {...props}
      />
    )
  );
  ```
- **Razón**: Es extremadamente ligero, no requiere dependencias y se adapta a cualquier tamaño mediante clases de ancho/alto personalizadas.

### 3. Creación del componente `EmptyState`
- **Decisión**: Unificar el visual cuando no hay registros en tablas, citas o búsquedas:
  ```tsx
  export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description: string;
    icon?: React.ComponentType<any>;
    action?: React.ReactNode;
  }
  ```
  Renderiza una estructura con un icono centrado, un título de tamaño `text-title-md`, una descripción en `text-body-md` y un espacio para botones o acciones.

## Risks / Trade-offs

- **[Riesgo] Estilos rotos al reemplazar selectores nativos** → Al implementar `<Select />`, es vital verificar la propiedad `appearance-none` para que el icono personalizado de flecha o los iconos de Lucide no colisionen con las flechas nativas del navegador.
- **[Riesgo] Pérdida de interactividad en formularios** → El uso de `React.forwardRef` en `<Select />` y `<Textarea />` es estrictamente necesario para garantizar que integraciones con `react-hook-form` o referencias directas (`useRef`) sigan funcionando de forma transparente.
