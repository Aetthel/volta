# Architecture & Design: Rendimiento y Alta Concurrencia

## Diagrama de Arquitectura de Concurrencia y Caché

```mermaid
graph TD
    ClientMobile["📱 Cliente Móvil (Low-End / 3G)"] -->|Payload Mínimo / Code Splitting| NextApp["⚡ Next.js App Router (Client)"]
    NextApp -->|HTTP / REST| ExpressAPI["🚀 Express Backend Server"]
    
    subgraph "Capa de Caché y Colas"
        ExpressAPI <-->|1. Lectura Caché (< 5ms)| RedisCache[("⚡ Redis Cache & Queues")]
    end
    
    subgraph "Capa de Persistencia"
        ExpressAPI <-->|2. Fallback Lectura / Escritura con Índices B-Tree| Postgres[("🐘 PostgreSQL (Indexed Tables)")]
    end
    
    subgraph "Invalidación Reactiva"
        ExpressAPI -.->|Invalidate cache:biz:{id}:* on MUTATION| RedisCache
    end
```

## Estrategias Técnicas

### 1. Frontend: Dynamic Imports & Virtual DOM
- Usar `next/dynamic` para diferir la descarga de modales hasta que el usuario hace clic en abrirlos.
- En la vista de agenda diaria/semanal, renderizar bloques horarios en ventanas virtuales para mantener un árbol DOM plano y eficiente en navegadores móviles WebKit/Chromium antiguos.

### 2. Backend: Redis Cache Service & Invalidation Strategy
- **Estructura de Claves**:
  - `volta:cache:{businessId}:services` -> JSON serializado de servicios activos.
  - `volta:cache:{businessId}:profile` -> Perfil de negocio y horarios.
- **Invalidación**:
  - Al ejecutar `createService`, `updateService`, `deleteService`, se elimina la clave `volta:cache:{businessId}:services`.
  - Al actualizar el perfil de negocio, se elimina `volta:cache:{businessId}:profile`.

### 3. Base de Datos: Índices B-Tree en PostgreSQL
- Prisma generará índices B-Tree específicos que optimizan las cláusulas `WHERE businessId = ? AND appointmentDate BETWEEN ? AND ?` y `WHERE businessId = ? AND status = ?`.
- Esto reduce el coste de escaneo de tablas de $\mathcal{O}(N)$ a $\mathcal{O}(\log N)$, eliminando bloqueos de fila durante inserciones concurrentes.

### 4. Pruebas de Estrés con Autocannon
- Un script Node.js ligero que ejecuta 50 conexiones concurrentes durante 10 segundos contra endpoints de lectura y endpoints de reservas simulados.
- Medición de métricas: Requests/sec, Latencia media, Latencia $P_{95}$, Latencia $P_{99}$ y tasa de errores.
