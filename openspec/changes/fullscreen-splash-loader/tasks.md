# Tasks: FullScreen Splash Loader

- [ ] 1. Crear el componente `FullScreenSplash` en `frontend/components/FullScreenSplash.tsx`
  - [ ] Añadir soporte para estado determinado (porcentaje 0-100) e indeterminado (animación shimmer)
  - [ ] Implementar el diseño con isotipo de Volta, barra de progreso estilizada y colores del tema
- [ ] 2. Integrar `FullScreenSplash` en `frontend/app/(landing)/page.tsx`
  - [ ] Activar el Splash cuando `isCreatingDemo` sea true durante `handleVerDemo`
  - [ ] Añadir actualización de mensajes dinámicos durante la creación de la demo
- [ ] 3. Actualizar `frontend/app/loading.tsx` con el componente `FullScreenSplash`
- [ ] 4. Verificar la fluidez visual al pulsar "Ver Demo" en la landing page
