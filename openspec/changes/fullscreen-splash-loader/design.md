# Design: FullScreen Splash Loader

## Context & User Problem

Cuando los usuarios hacen clic en "Ver Demo" en la landing page de Volta, la acción toma entre 2 y 4 segundos en el backend (creando la demo, autenticando y navegando). El estado actual muestra únicamente una animación pequeña dentro del botón mientras la página permanece estática, generando una sensación de parón seguida de un redireccionamiento brusco ("teletransporte").

## Design Solution

### 1. Component `FullScreenSplash`

El componente `FullScreenSplash` renderiza una capa fija de 100vw x 100vh (`fixed inset-0 z-50`) utilizando el color de fondo dinámico de la aplicación (`bg-surface` / `text-on-surface`):

- **Branding**: Logotipo / Isotipo de Volta con efecto de respiro/pulso de opacidad (`animate-pulse` o transición suave).
- **ProgressBar**: Pista delgada (180px x 4px) con bordes redondeados (`rounded-full`).
  - Track: `var(--color-surface-container-high)` o `rgba(255,255,255,0.1)`.
  - Fill: Gradiente lineal `from-primary to-inverse-primary` (`#006565` a `#76d6d5`).
- **Estado Indeterminado / Determinado**:
  - Si se le pasa `progress` (0 a 100), la barra llena el porcentaje indicado con `transition-all duration-300`.
  - Si no se pasa `progress`, la barra ejecuta una animación lineal infinita (_shimmer / indeterminate_).
- **Texto explicativo**: Subtítulo opcional de estado (ej. _"Preparando tu entorno de demo..."_).

### 2. Integración en Landing Page (`handleVerDemo`)

Al iniciar `handleVerDemo`:

1. `setIsCreatingDemo(true)` monta `<FullScreenSplash message="Creando tu clínica de demostración..." />`.
2. Se ejecuta `fetch('/api/backend/demo')`.
3. Se realiza el `signIn('credentials')`.
4. Se ejecuta `router.push('/inicio')`.
5. Una vez en la nueva ruta o al desmontar, el Splash desaparece suavemente.

### 3. Integración en `app/loading.tsx`

El archivo `app/loading.tsx` renderizará `<FullScreenSplash message="Cargando Volta..." />` para las transiciones y carga inicial del cliente.
