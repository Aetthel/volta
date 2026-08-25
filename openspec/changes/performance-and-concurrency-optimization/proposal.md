# Proposal: Optimización Integral para Dispositivos de Bajo Rendimiento y Alta Concurrencia

## Contexto y Motivación
Volta ha evolucionado con éxito hacia una plataforma integral de reservas, facturación con Lemon Squeezy (MoR), gestión multisede y recordatorios automáticos por WhatsApp. Sin embargo, en un entorno de producción real:
1. **Dispositivos de Entrada / Móviles y Tablets**: Muchos profesionales (peluqueros, fisioterapeutas, recepcionistas) acceden a Volta desde teléfonos móviles de gama de entrada o tablets de bajo rendimiento con CPU y memoria RAM limitadas y conexiones 3G/4G inestables.
2. **Alta Concurrencia y Múltiples Sesiones**: Durante horas punta (aperturas de agenda matutinas, campañas de marketing por WhatsApp), cientos o miles de clientes y profesionales acceden simultáneamente para consultar disponibilidad y agendar citas.

Para garantizar una experiencia fluida (60 FPS, tiempo de respuesta < 100ms y cero caídas de base de datos), es necesario aplicar una optimización arquitectónica basada en las directrices de **`vercel-react-best-practices`** y **`sql-optimization-patterns`**.

## Objetivos Clave
1. **Frontend**:
   - Reducir el tamaño del bundle JavaScript inicial dividiendo dinámicamente (`next/dynamic`) modales y componentes no críticos para el primer render.
   - Virtualizar listas y grids extensos de citas/clientes para evitar que el DOM contenga miles de nodos inactivos.
   - Optimizar re-renders en cascada en las vistas de agenda y dashboard.
2. **Backend**:
   - Implementar capa de almacenamiento en caché en Redis (`cacheService.js`) para lecturas de alto impacto (catálogo de servicios, perfiles de negocio, horas disponibles de agenda) con invalidación reactiva automática en mutaciones.
   - Añadir índices B-Tree en PostgreSQL mediante Prisma (`[businessId, appointmentDate]`, `[businessId, status]`, `[businessId, phone]`, `[businessId, active]`) para reducir el coste de consultas a tiempo constante $\mathcal{O}(\log n)$.
   - Configurar límites óptimos de *Connection Pooling* en Prisma para tolerar ráfagas concurrentes de tráfico sin agotar los sockets de PostgreSQL.
3. **Pruebas de Estrés y Métricas**:
   - Añadir suite de pruebas de carga (Load Testing) con Autocannon / k6 que verifique que el sistema procesa más de 500 req/s con $P_{95} < 80\text{ms}$.

## Alcance y No Objetivos
- **En alcance**: Bundle splitting en Next.js, caché en Redis para endpoints de lectura, índices en PostgreSQL, virtualización ligera de listas, pruebas de carga.
- **Fuera de alcance**: Migración de motor de base de datos o cambios en el diseño visual de la interfaz.
