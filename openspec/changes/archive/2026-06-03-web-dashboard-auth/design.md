## Context

El proyecto actual consiste en un bot de WhatsApp multitenant basado en Node.js, `whatsapp-web.js` y Prisma (PostgreSQL). Actualmente carece de una interfaz de usuario y la gestión de negocios se realiza manualmente. El objetivo es evolucionar esto hacia una plataforma SaaS donde el administrador gestione negocios y los negocios gestionen su propia configuración.

## Goals / Non-Goals

**Goals:**

- Implementar una aplicación Next.js integrada con el backend actual.
- Establecer un sistema de autenticación robusto con Auth.js.
- Permitir la personalización de mensajes por negocio.
- Proporcionar un panel de administración para la creación manual de cuentas.
- **NUEVO**: Implementar una agenda visual y un formulario de creación de citas optimizado para móviles.

**Non-Goals:**

- Implementar registro público de usuarios (auto-registro).
- Rediseñar el motor de WhatsApp (se mantiene `whatsapp-web.js`).

## UX/UI Design Strategy (Frontend Design Skill)

**Aesthetic Direction: "Modern Editorial Minimalism"**

- **Typography**: Pair a high-contrast Display Serif (e.g., _Cormorant Garamond_ style) for headings with a characterful Geometric Sans (e.g., _Syne_ or _Space Grotesk_) for functional data. Avoid generic fonts like Inter.
- **Color Palette**: Sophisticated neutrals (Paper white `#F9F9F9`, Charcoal `#1A1A1A`) with a single vibrant "Solar Green" (`#22C55E`) for primary actions.
- **Spatial Composition**: Generous negative space, asymmetric headers, and a "Timeline" layout for mobile that feels like a premium physical planner.
- **Motion**: Use staggered entry animations for dashboard cards and a smooth "Drawer" transition for the appointment form to provide a high-end, tactile feel.

## Decisions

### 1. Unificación en Next.js (App Router)

... (rest) ...
... (rest of the decisions) ...

### 5. Interfaz de Agenda y Formulario (UX/UI)

- **Decisión**: Usar una vista de lista tipo "Timeline" para el móvil y un calendario para desktop.
- **Razón**: En móviles, las listas son más fáciles de usar que los calendarios densos. El formulario será un "Drawer" (panel inferior) para facilitar la entrada de datos con una mano.
- **Tecnología**: `react-hook-form` con `zod` para validaciones rápidas y `shadcn/ui` para los componentes de calendario y formularios.
- **Decisión**: Mover el código actual de `src/` a la estructura de Next.js.
- **Razón**: Next.js permite manejar API routes (backend), Server Components (seguridad) y el frontend en un solo lugar, facilitando el despliegue en un VPS único.
- **Alternativa**: Mantener el backend separado. Descartado por complejidad de despliegue y latencia innecesaria.

### 2. Autenticación con Auth.js (NextAuth)

- **Decisión**: Usar Auth.js con el adaptador de Prisma y estrategia de sesión basada en JWT.
- **Razón**: Es el estándar para Next.js, ofrece seguridad probada y se integra perfectamente con Prisma.
- **Roles**: Se implementará un middleware que verifique el campo `role` en el token JWT para restringir el acceso a `/admin` y `/dashboard`.

### 3. Modelo de Base de Datos Extendido

- **Decisión**: Añadir campos `email` (unique), `password` (hashed), `role` (enum: ADMIN, BUSINESS), `welcomeMessage` y `reminderMessage` al modelo `Business`.
- **Razón**: Necesario para la autenticación y la personalización requerida por el usuario.

### 4. Ejecución del Bot de WhatsApp

- **Decisión**: El `WhatsAppManager` se inicializará como un Singleton dentro de un proceso de background o mediante un archivo de inicialización en el servidor.
- **Razón**: `whatsapp-web.js` requiere persistencia. En un entorno de Next.js en VPS, usaremos una instancia global para evitar múltiples inicializaciones del cliente de WhatsApp.

## Risks / Trade-offs

- **[Riesgo] Gestión de Memoria en VPS** → `whatsapp-web.js` abre instancias de Chromium (Puppeteer) por cada negocio.
  - **Mitigación**: Usar el flag `--single-process` en Puppeteer y monitorear el consumo de RAM. Recomendar al menos 2GB de RAM en el VPS.
- **[Riesgo] Desconexión de Sesiones** → El usuario pierde el acceso al bot si la sesión expira.
  - **Mitigación**: Implementar una vista en el dashboard que muestre el estado en tiempo real y permita regenerar el QR.
- **[Riesgo] Seguridad de Contraseñas** → Almacenamiento de credenciales.
  - **Mitigación**: Uso obligatorio de `bcryptjs` para el hashing antes de guardar en DB.

## Migration Plan

1. **DB**: Ejecutar migración de Prisma para añadir los nuevos campos.
2. **Setup**: Inicializar proyecto Next.js en la raíz o mover archivos actuales a `app/api`.
3. **Auth**: Configurar NextAuth y crear el primer usuario `ADMIN` mediante un script de seed.
4. **UI**: Construir páginas de login, admin y dashboard de negocio.
5. **Logic**: Refactorizar `bot.js` para leer los mensajes de la base de datos en lugar de strings fijos.
