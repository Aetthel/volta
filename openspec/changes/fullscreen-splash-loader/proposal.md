## Why

Actualmente, cuando un usuario solicita una demo en la landing page de Volta (`/`), o cuando la aplicación realiza un bootstrapping de sesión, la interfaz no ofrece feedback adecuado. El botón de demo muestra un spinner minúsculo mientras la pantalla permanece estática durante varios segundos, culminando en una redirección repentina ("teletransporte") hacia `/inicio`. Para mejorar drásticamente la percepción de calidad y fluidez, es necesario implementar un componente de carga a pantalla completa (**FullScreenSplash**) integrado con los colores y la marca de Volta.

## What Changes

- **Componente `FullScreenSplash`**: Creación de un componente reutilizable a pantalla completa con fondo dinámico del tema (`bg-surface`), el Isotipo de Volta con animación suave de presencia/respiración, y una barra de progreso lineal minimalista con gradiente (`primary` -> `inverse-primary`) y mensajes explicativos opcionales.
- **Integración en la Landing Page (`app/(landing)/page.tsx`)**: Al pulsar "Ver Demo", se activa inmediatamente el `FullScreenSplash` mostrando el progreso real de la creación de la demo y el inicio de sesión automático hasta navegar suavemente al dashboard.
- **Integración en el App Bootstrap / Loading Root (`app/loading.tsx`)**: Reemplazo del cargador genérico por el `FullScreenSplash` para las cargas iniciales de la aplicación.

## Capabilities

### New Capabilities

- `fullscreen-splash-loader`: Pantalla de carga completa de marca con barra de progreso lineal y animación fluida para inicialización de la app y creación de demos.

## Impact

- **Frontend (`frontend/components/FullScreenSplash.tsx`)**: Nuevo componente UI de carga a pantalla completa.
- **Landing Page (`frontend/app/(landing)/page.tsx`)**: Integración con el estado `isCreatingDemo`.
- **Root Loading (`frontend/app/loading.tsx`)**: Integración como cargador por defecto de la aplicación en Next.js.
