# performance-and-concurrency-optimization Specification

## Purpose
TBD - created by archiving change performance-and-concurrency-optimization. Update Purpose after archive.

## Requirements

### Requirement: Code Splitting y Carga Perezosa en Frontend para Dispositivos de Entrada
El cliente Next.js DEBE cargar de forma diferida (`next/dynamic` con `{ ssr: false }`) los componentes pesados que no se muestran en el primer render de la página, reduciendo el Total Blocking Time (TBT) a menos de 150ms.

#### Scenario: Carga bajo demanda de modales pesados
- **WHEN** un usuario en un dispositivo móvil con CPU limitada carga el Dashboard
- **THEN** los modales de checkout, gestión de trabajadores y bienvenida no deben incluirse en el bundle JavaScript inicial hasta que se solicite su apertura

### Requirement: Capa de Caché en Redis para Endpoints de Lectura Críticos
El backend DEBE incorporar un servicio `cacheService.js` conectado a Redis para servir catálogos de servicios y perfiles de negocio en menos de 5ms, invalidando claves automáticamente en mutaciones.

#### Scenario: Consulta de catálogo de servicios con caché activa
- **WHEN** múltiples usuarios o clientes consultan el catálogo de servicios de un negocio
- **THEN** la primera petición consulta la base de datos y almacena el resultado en Redis, y las siguientes peticiones se sirven directamente desde la memoria caché

#### Scenario: Invalidación reactiva tras mutación
- **WHEN** un administrador actualiza o añade un servicio
- **THEN** el backend elimina la clave de caché del negocio para que las siguientes consultas obtengan los datos actualizados

### Requirement: Indexación Compuesta en Base de Datos PostgreSQL
El esquema Prisma DEBE definir índices B-Tree compuestos (`@@index`) en las tablas de `Appointment`, `Client`, `Service`, `Invoice` y `User`.

#### Scenario: Búsqueda rápida de citas por negocio y fecha
- **WHEN** se consulta la agenda para un rango de fechas en un negocio con miles de citas históricas
- **THEN** la base de datos utiliza el índice compuesto `[businessId, appointmentDate]` evitando un escaneo secuencial de toda la tabla

### Requirement: Pruebas de Carga y Resiliencia de Concurrencia
El proyecto DEBE incluir un script de prueba de carga con Autocannon que simule al menos 50 conexiones simultáneas.

#### Scenario: Validación de latencia bajo estrés
- **WHEN** se ejecuta el script de pruebas de carga con 50 usuarios concurrentes
- **THEN** el percentil 95 ($P_{95}$) del tiempo de respuesta debe mantenerse inferior a 100ms y el porcentaje de errores debe ser del 0%

### Requirement: Optimización de Componentes React según Vercel Best Practices
El frontend de Next.js SHALL implementar patrones de optimización de Vercel Engineering, incluyendo `bundle-dynamic-imports` para subpaneles y modales secundarios, `rerender-memo` para filtros y transformaciones pesadas, y `rerender-dependencies` con valores primitivos en arrays de dependencias.

#### Scenario: Carga bajo demanda de secciones en Preferencias
- **WHEN** un usuario navega a la página de preferencias `/ajustes`
- **THEN** la vista de tarjetas generales se renderiza de inmediato y los módulos individuales (`ProfileSection`, `MessagesSection`, `BusinessSection`, `BillingSection`, `PersonalizationSection`) se descargan asíncronamente bajo demanda solo cuando el usuario selecciona dicha categoría

#### Scenario: Filtrado reactivo optimizado en catálogos y mensajes
- **WHEN** un usuario busca un servicio en el catálogo o escribe una plantilla en el simulador de WhatsApp
- **THEN** el cálculo de los elementos filtrados y la interpolación en vivo de variables se ejecuta mediante `useMemo` sin re-evaluar expresiones regulares ni filtrados en re-renders no relacionados

### Requirement: Eliminación de Cascadas Asíncronas en Páginas y Clientes
Las llamadas al backend en componentes del cliente SHALL ejecutarse en paralelo cuando no existan dependencias directas entre ellas (`async-parallel`), y cualquier operación `await` SHALL diferirse hasta la rama donde sea estrictamente necesaria (`async-defer-await`).

#### Scenario: Carga simultánea de horarios y servicios
- **WHEN** se carga la sección de configuración del negocio
- **THEN** las peticiones de horarios comerciales y catálogo de servicios se inician concurrentemente en paralelo evitando bloqueos en cascada
