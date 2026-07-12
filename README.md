# Volta: Sistema de Gestión de Citas y Automatización de Mensajería

Volta es una plataforma monorepo diseñada para la gestión de citas, clientes y servicios para empresas, con un enfoque centralizado en la automatización de comunicaciones mediante la integración directa con WhatsApp Web. La plataforma incluye un módulo de cumplimiento legal para la Ley Orgánica de Protección de Datos (LOPD) en España.

## Arquitectura y Tecnologías

El proyecto está estructurado como un monorepo que separa la interfaz de usuario de los servicios backend y la gestión de la base de datos.

### Frontend
El frontend se ha construido utilizando Next.js, aprovechando las capacidades del App Router y renderizado en el servidor para optimizar la velocidad y el SEO. Las tecnologías clave incluyen:
* React 19 para la composición de la interfaz de usuario.
* NextAuth.js (v5) para la autenticación y el control de accesos basados en roles.
* Tailwind CSS (v4) como framework de diseño para lograr una interfaz moderna y adaptativa.
* React Hook Form y Zod para la validación avanzada de formularios.
* date-fns para la manipulación y el formateo de fechas y horarios.

### Backend
El backend es un servicio Node.js que expone una API REST utilizando Express.js. Las tecnologías clave incluyen:
* Prisma ORM para el modelado y las consultas a la base de datos PostgreSQL.
* whatsapp-web.js para la automatización e integración con el cliente de WhatsApp mediante una instancia de Puppeteer/Chromium.
* node-cron para la programación de tareas recurrentes de fondo.
* Zod para la validación estricta de esquemas de datos entrantes.
* Helmet y express-rate-limit para la seguridad y control de tasa de solicitudes.

### Infraestructura y Despliegue
La aplicación está completamente dockerizada para garantizar la consistencia entre entornos de desarrollo y producción:
* Docker Compose para levantar localmente el frontend, backend y la base de datos PostgreSQL.
* GitHub Container Registry (GHCR) para almacenar las imágenes de producción compiladas a través de flujos de trabajo de GitHub Actions.
* Watchtower para el despliegue automático y continuo en el servidor de producción.
* Cloudflare Tunnel para exponer de forma segura los servicios sin abrir puertos públicos y gestionar la encriptación SSL.

## Estructura del Repositorio

La estructura principal del monorepo es la siguiente:

* backend/: Contiene el servidor Express.js, esquemas de base de datos (Prisma), la integración del cliente de WhatsApp y tareas cron programadas.
* frontend/: Contiene la aplicación Next.js estructurada con el App Router y los estilos globales del sistema.
* docker-compose.yml: Configuración de Docker Compose para el entorno de desarrollo.
* docker-compose.prod.yml: Configuración de Docker Compose para el entorno de producción.
* Dockerfile y Dockerfile.prod: Definiciones de construcción de contenedores Docker para desarrollo y producción.
* .github/workflows/docker-publish.yml: Flujo de trabajo de GitHub Actions que compila y publica automáticamente la imagen en GHCR al hacer push a la rama main.

## Características Clave del Sistema

### Gestión de Citas y Calendario
Las empresas pueden configurar sus horarios de apertura y cierre (BusinessHours) y dar de alta sus servicios con precios y duraciones específicas. La agenda permite agendar y gestionar el estado de las citas (Appointment).

### Integración Automatizada de WhatsApp
A través de la biblioteca whatsapp-web.js, cada negocio puede vincular su propia cuenta de WhatsApp escaneando un código QR dinámico desde la interfaz web. El sistema gestiona las sesiones de forma independiente persistiendo los datos de autenticación local.

### El Sentinel (Proceso de Notificaciones)
Un proceso en segundo plano programado con cron se ejecuta diariamente. Este escanea la base de datos buscando citas pendientes para el día siguiente y envía automáticamente un mensaje recordatorio personalizado a los clientes que han dado su consentimiento legal.

### Sistema de Consentimiento LOPD
Para cumplir con la legislación española (LOPD), el sistema impide el envío de mensajes comerciales o recordatorios a cualquier cliente que no tenga su consentimiento marcado como aceptado. Cuando se registra un cliente, el sistema puede enviarle un enlace único de WhatsApp. El cliente accede a una página web pública específica en el frontend para aceptar los términos y condiciones de privacidad, lo que actualiza de inmediato su estado a aceptado y desbloquea el envío de recordatorios.

## Configuración del Entorno de Desarrollo

### Requisitos Previos
* Node.js (versión 22 o superior)
* Docker y Docker Compose (opcional, pero recomendado)
* Un cliente de base de datos compatible con PostgreSQL si se prefiere ejecución nativa

### Paso 1: Configurar Variables de Entorno
Crea un archivo .env en la raíz del proyecto basándote en el archivo de plantilla .env.example:

DATABASE_URL="postgresql://volta_user:volta_password@localhost:5432/volta_db?schema=public"
API_KEY="clave_secreta_api"
AUTH_SECRET="secreto_para_next_auth"
PORT=3000

### Paso 2: Levantar con Docker Compose
La forma más sencilla de ejecutar el entorno local es utilizando Docker Compose, el cual creará los contenedores necesarios e instalará Chromium en el contenedor del backend para whatsapp-web.js:

docker compose up -d

Este comando iniciará:
* volta-db en el puerto 5432
* volta-backend en el puerto 3001
* volta-frontend en el puerto 3000

### Paso 3: Inicializar la Base de Datos
Si estás utilizando la base de datos levantada con Docker, ejecuta las migraciones de Prisma para configurar el esquema relacional:

pnpm --filter backend prisma:push

También puedes ejecutar el script de inicialización de datos de prueba (seed):

pnpm --filter backend seed

## Ejecución Local sin Docker

Si prefieres ejecutar el proyecto directamente en tu máquina local:

1. Instala las dependencias en la raíz del monorepo:
   pnpm install

2. Levanta una base de datos PostgreSQL local y asegúrate de que el DATABASE_URL en tu .env apunte a ella.

3. Sincroniza el esquema de base de datos:
   pnpm --filter backend prisma:push

4. Inicia ambos servicios de manera concurrente usando el script raíz:
   pnpm dev

Esto iniciará el frontend y backend simultáneamente en los puertos configurados.

## Guía de Despliegue en Producción

El proyecto implementa un flujo de integración y despliegue continuo (CI/CD) automatizado. Para obtener una guía detallada paso a paso sobre cómo configurar el servidor, crear los tokens personales en GitHub y configurar Watchtower con Docker Compose en producción, consulte el archivo DEPLOYMENT.md en la raíz de este proyecto.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo LICENSE para obtener más información.
