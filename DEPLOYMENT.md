# Guía de Despliegue Continuo (CD) - Volta

Esta guía explica cómo funciona el despliegue automático del proyecto Volta en producción mediante el uso de **GitHub Container Registry (GHCR)** y **Watchtower**.

## Arquitectura de Despliegue

```
[ Push a main ] ──▶ [ GitHub Actions ] ──▶ [ Compila y sube a GHCR ]
                                                   │
                                                   ▼
[ Servidor ] ◀─── [ Watchtower ] (Cada 5 min descarga y reinicia frontend/backend)
```

1. Cada vez que subes cambios a la rama `main` en GitHub, el flujo de trabajo `.github/workflows/docker-publish.yml` compila la nueva imagen Docker de producción y la publica en `ghcr.io/kore29/volta:latest`.
2. El contenedor `volta-watchtower` en tu servidor monitorea la imagen publicada en GHCR. Cuando detecta cambios, realiza la descarga y reinicia ordenadamente los contenedores `volta-frontend` y `volta-backend`.

---

## Configuración del Servidor (Paso a Paso)

Para poner en marcha este flujo automático, sigue estos pasos en el servidor de producción:

### Paso 1: Generar un Token de Acceso Personal en GitHub
Dado que las imágenes compiladas en GHCR suelen ser privadas, tu servidor necesita permisos para descargarlas:
1. Entra a tu cuenta de GitHub y ve a **Settings** ──▶ **Developer settings** ──▶ **Personal access tokens** ──▶ **Tokens (classic)**.
2. Genera un nuevo token con el alcance (scope) `read:packages`.
3. Copia el token generado (lo usarás como contraseña).

### Paso 2: Autenticar Docker en el Servidor
En la terminal del servidor, inicia sesión en el registro de paquetes de GitHub utilizando tu usuario y el token de acceso clásico creado en el paso anterior:

```bash
docker login ghcr.io
```

* **Username:** Tu usuario de GitHub.
* **Password:** El Token de Acceso Personal (PAT) clásico copiado en el paso anterior.

Este comando guardará tus credenciales de forma segura en `~/.docker/config.json`, archivo que es leído internamente por Watchtower para conectarse a GHCR.

### Paso 3: Iniciar el Proyecto en Producción
Asegúrate de que la variable de entorno `CLOUDFLARE_TUNNEL_TOKEN` esté configurada en tu archivo `.env.prod`.

Levanta los contenedores en segundo plano:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Este comando levantará:
* `volta-backend` (con el seed de clientes deshabilitado en producción).
* `volta-frontend`
* `volta-cloudflared` (túnel para acceso SSL externo).
* `volta-watchtower` (guardián de actualizaciones).

---

## Verificación y Mantenimiento

* **Ver los logs del despliegue automático:**
  Puedes verificar si Watchtower está buscando e instalando actualizaciones revisando sus logs:
  ```bash
  docker logs -f volta-watchtower
  ```
* **Limpieza de disco:**
  Watchtower está configurado con la bandera `--cleanup`, lo que garantiza que las versiones antiguas y en desuso de tus imágenes Docker se eliminen del servidor tras cada actualización exitosa, evitando el desgaste de espacio en disco.
