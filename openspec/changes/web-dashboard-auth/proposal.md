## Why

Actualmente, la gestión de negocios y la configuración de sus bots de WhatsApp se realiza de forma manual o mediante llamadas directas a la API. Para escalar el servicio, necesitamos una interfaz web centralizada, segura y profesional que permita al administrador gestionar clientes y a los negocios configurar su propia experiencia de usuario (mensajes y conexión).

## What Changes

- **Next.js Web App**: Creación de una aplicación web moderna utilizando Next.js, Tailwind CSS y shadcn/ui.
- **Autenticación Multitenant**: Implementación de Auth.js para gestionar el acceso basado en roles (Admin para el dueño de la plataforma y Business para los clientes).
- **Esquema de Base de Datos**: Actualización de Prisma para incluir credenciales de acceso y metadatos de configuración por negocio.
- **Unificación de Backend**: Integración de la lógica del bot de WhatsApp dentro del proyecto Next.js para simplificar el despliegue y la comunicación.

## Capabilities

### New Capabilities
- `web-authentication`: Sistema de inicio de sesión, cierre de sesión y protección de rutas basado en roles.
- `admin-business-control`: Interfaz de super-administrador para crear, listar y gestionar cuentas de negocios.
- `business-settings`: Interfaz para que cada negocio personalice sus plantillas de mensajes (Bienvenida y Recordatorio).
- `appointment-management`: Agenda visual (calendario/lista) y formulario rápido para programar citas.

### Modified Capabilities
- `multitenant-core`: El núcleo actual debe extenderse para soportar la autenticación de usuarios y la gestión de sesiones web.
- `appointment-management-core`: Los requerimientos de creación de citas deben optimizarse para una UX rápida desde la web.

## Impact

- `prisma/schema.prisma`: Cambios estructurales en los modelos Business y Appointment.
- `src/bot.js` y `src/index.js`: Migración y unificación dentro de la estructura de Next.js.
- Nuevas dependencias: `next-auth`, `lucide-react`, `shadcn/ui` components.
