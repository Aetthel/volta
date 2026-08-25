## 1. Optimización de Base de Datos y Consultas (PostgreSQL / Prisma)

- [ ] 1.1 Añadir índices compuestos `@@index` en `schema.prisma` para `Appointment`, `Client`, `Service`, `Invoice` y `User`.
- [ ] 1.2 Ejecutar `pnpm --filter backend prisma:push` y regenerar el cliente Prisma.
- [ ] 1.3 Revisar y optimizar consultas en `appointmentsService.js` y `services.js` para usar `select` estricto y evitar over-fetching de datos.

## 2. Capa de Caché en Redis e Invalidación Reactiva

- [ ] 2.1 Crear `backend/src/services/cacheService.js` con soporte para `get`, `set` (TTL) e `invalidatePattern` usando el cliente Redis existente.
- [ ] 2.2 Integrar la caché en `servicesController.js` y `businessController.js` para servir lecturas en < 5ms.
- [ ] 2.3 Añadir invalidación automática de caché en mutaciones (crear, actualizar o borrar servicios/negocio).

## 3. Optimización de Frontend para Dispositivos de Bajo Rendimiento

- [ ] 3.1 Convertir la carga de modales pesados (`SubscriptionCheckoutModal`, `WorkerModal`, `WelcomeModal`) a carga dinámica perezosa (`next/dynamic` con `ssr: false`).
- [ ] 3.2 Memoizar componentes de la agenda y selectores en `inicio/page.tsx` para evitar re-renderizados en cascada al cambiar de fecha o actualizar citas.
- [ ] 3.3 Verificar que el bundle inicial del cliente se reduzca y el hilo principal permanezca desahogado en dispositivos móviles.

## 4. Pruebas de Carga y Validación de Alta Concurrencia

- [ ] 4.1 Crear un script de pruebas de carga (`backend/src/tests/load/concurrencyTest.js`) con Autocannon que simule 50+ conexiones concurrentes y cientos de peticiones.
- [ ] 4.2 Ejecutar las pruebas de carga y verificar que $P_{95} < 100\text{ms}$ con 0% de errores bajo estrés.
- [ ] 4.3 Ejecutar la suite completa de tests de frontend y backend para comprobar compatibilidad total.
