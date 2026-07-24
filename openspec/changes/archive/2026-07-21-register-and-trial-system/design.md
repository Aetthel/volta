## Context

Actualmente Volta no dispone de un flujo de autoservicio público para que nuevos profesionales/negocios se registren por sí mismos. Las empresas demo eran gestionadas manualmente o mediante seeds. Con este cambio, permitimos el registro directo en `/register`, asignando un período de prueba de 10 días en la versión de suscripción **Plan Pro (25€/mes)** y mostrando avisos de estado de cuenta vinculados con las alertas del panel.

## Goals / Non-Goals

**Goals:**

- Crear el flujo público de registro `/register` con selector de tipo de negocio.
- Extender la base de datos (Prisma `schema.prisma`) para almacenar el tipo de negocio (`businessType`) y el plan de suscripción (`subscriptionPlan`: `BASE` vs `PRO`).
- Asignar automáticamente `isDemo: true`, `demoExpiresAt: Date.now() + 10 días` y `subscriptionPlan: "PRO"`.
- Crear el componente `TrialBanner.tsx` en la parte superior fija del dashboard mostrando los días restantes e incitando a la selección de plan.
- Integrar avisos con el sistema de alertas (modelo `Alert`) al entrar en los últimos 3 días de prueba o al caducar.

**Non-Goals:**

- Procesamiento real de tarjetas con Stripe en esta fase (se deja listo el estado de la suscripción).

## Decisions

- **Selector de Tipo de Negocio**: Opciones predefinidas: `Peluquería / Barbería`, `Estética / Belleza / Uñas`, `Clínica / Fisioterapia / Salud`, `Odontología`, `Personal Trainer / Fitness`, `Consultoría / Servicios Profesionales`.
- **Top Trial Banner**: Posicionado en la parte superior del layout (`layout.tsx` / `Header.tsx`). Estilo barra clásica fija con contador regresivo y botón de llamada a la acción ("Elegir Plan").
- **Vinculación con Alertas**: Generación de avisos en el modelo `Alert` cuando los días de prueba sean 3, 1 o 0 (caducado), mostrándose tanto en la barra superior como en el menú de alertas.

## Risks / Trade-offs

- **[Riesgo] Expiración sin bloquear funcionalidad principal:** Si la prueba caduca, la barra debe advertir que el bot de WhatsApp o ciertas funciones Pro quedarán pausadas.
  - _Mitigación:_ Comprobación de estado en backend al ejecutar automaciones.
