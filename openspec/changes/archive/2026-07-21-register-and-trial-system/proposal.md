## Why

Para permitir que nuevos negocios de servicios (peluquerías, estéticas, clínicas, odontología, personal trainers, consultorías, etc.) prueben Volta de manera autónoma, se necesita un flujo de registro directo. Durante el registro, el negocio podrá seleccionar su categoría/tipo de actividad y acceder inmediatamente a un período de prueba gratuito de 10 días en la modalidad Plan Pro (25€/mes).

Además, para mantener informado al usuario sobre el estado de su cuenta y promover la conversión antes de la expiración de la prueba, se incorporará una barra superior estática (top trial banner) en todas las pantallas del panel, vinculada con el sistema de alertas del usuario.

## What Changes

- **Registro de Usuarios y Negocios (`/register`)**: Creación de la página y formulario de registro público donde un usuario registra su nombre, email, contraseña, nombre del negocio, teléfono y **tipo/categoría de negocio**.
- **Integración con "Get Started" / "Empezar Gratis" de la Landing Page (`/`)**: Todos los botones de acción como "Get Started", "Empezar Gratis" y los botones de los planes en la Landing Page (`/app/page.tsx`), así como "Crear Cuenta Nueva" en Login (`/app/login/page.tsx`), llevarán directamente al flujo de registro `/register`.
- **Período de Prueba de 10 Días (Plan Pro - 25€)**: Creación automática de la cuenta con un estado de prueba de 10 días (`isDemo: true`, `demoExpiresAt: Date.now() + 10 días`) asignando automáticamente la suscripción al **Plan Pro (25€/mes)** con todas las funcionalidades habilitadas.
- **Top Trial Banner en Dashboard**: Implementación de una barra clásica fija en la parte superior del layout (`/app/layout.tsx` o `Header.tsx`), mostrando los días restantes de prueba gratuita y un botón de llamada a la acción para suscribirse ("Seleccionar Plan").
- **Integración con Sistema de Alertas**: Generación automática de notificaciones/alertas en el panel (`Alert` model) vinculadas al avance del período de prueba (avisos a los 3 días, 1 día y tras caducar).
- **Gestión de Planes (18€ vs 25€)**: Soporte en base de datos para diferenciar entre el **Plan Base (18€/mes)** y el **Plan Pro (25€/mes)**, asegurando que la prueba inicie en Plan Pro.

## Capabilities

### New Capabilities

- `user-registration-flow`: Formulario público de registro de nuevos negocios con selección de tipo de actividad y creación automática de usuario ADMIN.
- `trial-period-management`: Gestión automática de la prueba de 10 días en Plan Pro (25€/mes), cálculo de días restantes y restricción al vencer.
- `top-trial-banner`: Componente visual en la parte superior del dashboard que indica los días restantes de prueba e invita a seleccionar plan.

### Modified Capabilities

- `business-settings`: Añadir soporte para guardar el tipo/categoría de negocio (`businessType`) y el plan de suscripción (`subscriptionPlan`).
- `alerts-system`: Generar alertas automáticas de estado de cuenta/prueba vinculadas al banner y centro de notificaciones.

## Impact

- **Database**: Extensión del modelo `Business` en Prisma para incluir `businessType` y `subscriptionPlan`.
- **Backend**: Nuevo endpoint de registro y utilidades para cálculo de vigencia de prueba.
- **Frontend**: Nueva página `/register`, componente `TrialBanner.tsx`, actualización de la navegación y alertas.
