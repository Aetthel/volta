## 1. Bundle Splitting y Dynamic Imports

- [x] 1.1 Configurar dynamic imports (`next/dynamic`) en las sub-secciones de Preferencias (`ajustes/page.tsx`) y verificar que los chunks se descargan bajo demanda
- [x] 1.2 Auditar modales de creación en `agenda/page.tsx` y `EventManager.tsx` verificando que se cargan diferidos con `{ ssr: false }`
- [x] 1.3 Auditar importaciones de librerías secundarias en `booking/[businessId]/page.tsx` para reducir el bundle de la página pública

## 2. Re-render Optimization y Estado Derivado

- [x] 2.1 Envolver en `useMemo` el filtrado de catálogo de servicios (`filteredServices`) en `BusinessSection.tsx` y verificar que no se recalcula en cambios ajenos
- [x] 2.2 Envolver en `useMemo` la interpolación de texto de prueba (`previewMessage`) en `MessagesSection.tsx` y verificar respuesta instantánea
- [x] 2.3 Memoizar transformaciones de eventos del calendario en `EventManager.tsx` (`coloredEvents`, `visibleRange`) para evitar refiltrados al cambiar vistas
- [x] 2.4 Verificar que `clientes/page.tsx` y `equipo/page.tsx` derivan estados de filtro y búsqueda durante el render o con `useMemo` sin dependencias cíclicas

## 3. Saneamiento de Hooks y Dependencias Asíncronas

- [x] 3.1 Sustituir dependencias de objetos `session` por identificadores primitivos (`session?.user?.id`, `businessId`) en `ajustes/page.tsx`
- [x] 3.2 Paralelizar peticiones independientes en la carga inicial de `inicio/page.tsx` mediante `Promise.all`
- [x] 3.3 Validar que los controladores de eventos en modales no ejecuten efectos secundarios pesados en el hilo principal de render

## 4. Verificación y Compilación

- [x] 4.1 Ejecutar `pnpm --filter frontend exec tsc --noEmit` y verificar 0 errores de tipado
- [x] 4.2 Validar navegación e interactividad en tiempo real mediante pruebas manuales en el entorno Docker
