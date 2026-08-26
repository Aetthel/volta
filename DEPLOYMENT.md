# Guía de Despliegue en Producción - Volta (Portainer / Docker Compose)

Esta guía explica la configuración e integración de **Volta** en producción utilizando **Portainer** (o Docker Compose) con instancias externas gestionadas de **PostgreSQL** y **Redis**.

---

## Arquitectura de Despliegue

```
[ Push a main ] ──▶ [ GitHub Actions ] ──▶ [ Compila y sube a GHCR ]
                                                   │
                                                   ▼
[ Portainer / Servidor ] ◀─── [ Contenedores backend/frontend conectan a Postgres/Redis externos ]
```

1. **GitHub Actions** compila la imagen Docker de producción (`ghcr.io/aetthel/volta:latest`) y la publica en GitHub Container Registry.
2. **Portainer** gestiona el Stack utilizando `docker-compose.prod.yml` y las variables de entorno inyectadas directamente desde la interfaz de Portainer.

---

## Configuración de Variables de Entorno en Portainer

Al crear o actualizar el Stack en **Portainer**, configura las siguientes variables de entorno:

### 1. Base de Datos PostgreSQL (Gestionada / Externa)

- `DATABASE_URL`: Cadena de conexión PostgreSQL (ej. `postgresql://usuario:password@postgres-host:5432/volta_db?schema=public&sslmode=require`)

### 2. Motor de Redis (Gestionado / Externo)

Puedes utilizar cualquiera de los dos formatos aceptados:

**Opción A — Cadena de conexión URL (Recomendado):**

- `REDIS_URL`: URL completa de conexión Redis (ej. `redis://:password@redis-host:6379` o `rediss://...` para SSL/TLS).

**Opción B — Variables separadas:**

- `REDIS_HOST`: Host/IP del servidor Redis externo.
- `REDIS_PORT`: Puerto de Redis (por defecto `6379`).
- `REDIS_PASSWORD`: Contraseña de autenticación.
- `REDIS_USERNAME`: Usuario (opcional si requiere ACL).
- `REDIS_TLS`: `true` si requiere cifrado TLS/SSL.

### 3. Seguridad y Aplicación

- `API_KEY`: Clave estática para peticiones internas/API.
- `AUTH_SECRET`: Secreto para Auth.js / NextAuth.
- `BACKEND_JWT_SECRET`: Secreto para JWT del backend.
- `LOPD_HMAC_SECRET`: Secreto HMAC para tokens LOPD.
- `FRONTEND_URL`: URL pública del frontend (ej. `https://volta.kore29.com`).
- `NEXTAUTH_URL`: URL del callback de autenticación (ej. `https://volta.kore29.com`).
- `PORT_HOST`: Puerto expuesto en el host (por defecto `3001`).

---

## Despliegue con Portainer

1. En Portainer, ve a **Stacks** ──▶ **Add stack**.
2. Asigna un nombre al stack (ej. `volta`).
3. Selecciona **Repository** o **Web editor** utilizando el archivo `docker-compose.prod.yml`.
4. Rellena las variables de entorno enumeradas arriba en la sección **Environment variables**.
5. Haz clic en **Deploy the stack**.

Al arrancar, el contenedor `volta-backend` ejecutará automáticamente las migraciones pendientes de Prisma (`npx prisma migrate deploy`) sobre tu PostgreSQL externo y se conectará de manera segura al clúster/instancia de Redis externa para gestionar las colas de BullMQ y el almacenamiento en caché.

---

## Verificación

- **Health Check del Backend:**
  `GET https://tu-dominio.com/health` (o `http://localhost:3001/health`)
  Debe retornar estado HTTP 200:
  ```json
  {
    "status": "ok",
    "services": {
      "database": "connected",
      "redis": "connected"
    }
  }
  ```
