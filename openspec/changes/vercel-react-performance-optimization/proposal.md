## Why

La aplicación web de Volta contiene componentes interactivos complejos (calendario de citas, gestión de clientes, simulación en vivo de WhatsApp, configuraciones de negocio y tablas analíticas) que requieren una optimización rigurosa de rendimiento según los estándares de ingeniería de Vercel. Aplicar estas directrices reduce los tiempos de carga inicial (FCP/TTI), elimina renderizados redundantes, erradica cuellos de botella asíncronos y asegura una experiencia fluida tanto en dispositivos móviles como en escritorio.

## What Changes

- **División Dinámica de Paquetes (`bundle-dynamic-imports`)**: Cargar componentes pesados, modales secundarios y sub-paneles (`ProfileSection`, `MessagesSection`, `BusinessSection`, `BillingSection`, `PersonalizationSection`, `UpgradeProModal`, `NewAppointmentModal`) mediante `next/dynamic` con `ssr: false` o placeholders optimizados.
- **Optimización de Re-renders y Estado Derivado (`rerender-memo`, `rerender-derived-state-no-effect`)**: Sustituir sincronizaciones en `useEffect` por cálculo derivado durante el render o mediante `useMemo` en transformaciones de datos, búsquedas y filtros en listas grandes.
- **Saneamiento de Dependencias de Hooks (`rerender-dependencies`)**: Utilizar primitivos (`id`, `businessId`) en los arrays de dependencias en lugar de objetos compuestos de sesión para evitar ejecuciones innecesarias de efectos.
- **Eliminación de Cascadas Asíncronas (`async-parallel`, `async-defer-await`)**: Paralelizar consultas independientes del backend mediante `Promise.all` y diferir `await` hasta el momento exacto de su consumo.
- **Optimización de Expresiones y Recursos (`js-hoist-regexp`, `rendering-animate-svg-wrapper`)**: Elevar expresiones regulares fuera de los bucles y desacoplar animaciones de elementos SVG hacia contenedores `div`.

## Capabilities

### New Capabilities
<!-- No new functional business capabilities are being introduced -->

### Modified Capabilities
- `performance-and-concurrency-optimization`: Estandarización de patrones de carga diferida (dynamic imports), memoización de filtros/vistas y minimización de cascadas asíncronas en el frontend de Next.js.

## Impact

- **Frontend Core**: `frontend/app/(dashboard)/`, `frontend/components/settings/`, `frontend/components/EventManager.tsx`, `frontend/components/Sidebar.tsx`.
- **Bundle Size**: Reducción sustancial del tamaño de bundle JavaScript en la primera carga de rutas críticas.
- **Compatibilidad**: Sin cambios destructivos en contratos de API ni comportamiento funcional del usuario.
