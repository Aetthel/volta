import prisma from "../config/db.js";

export const checkSubscriptionLimits = (action) => {
  return async (req, res, next) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        return res.status(400).json({ error: "No se encontró negocio asociado al usuario." });
      }

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          _count: {
            select: { users: true },
          },
        },
      });

      if (!business) {
        return res.status(404).json({ error: "Negocio no encontrado." });
      }

      // Check for Expired status
      if (business.subscriptionStatus === "EXPIRED") {
        return res.status(403).json({
          error: "Tu período de prueba o suscripción ha vencido. Elige un plan para continuar.",
          requiresUpgrade: true,
        });
      }

      // If user is on TRIALING or PRO or ENTERPRISE, features are unlimited
      if (
        business.subscriptionStatus === "TRIALING" ||
        business.subscriptionPlan === "PRO" ||
        business.subscriptionPlan === "ENTERPRISE"
      ) {
        return next();
      }

      // Plan BASIC Limits (18€/mes)
      if (business.subscriptionPlan === "BASIC") {
        if (action === "CREATE_LOCATION") {
          return res.status(403).json({
            error:
              "El Plan Básico (18€/mes) permite 1 sola sede. Actualiza a Plan Pro para sedes ilimitadas.",
            requiresUpgrade: true,
            currentLimit: 1,
          });
        }

        if (action === "INVITE_MEMBER") {
          const userCount = business._count?.users || 0;
          if (userCount >= 3) {
            return res.status(403).json({
              error:
                "El Plan Básico permite hasta 3 miembros en el equipo. Actualiza a Plan Pro para miembros ilimitados.",
              requiresUpgrade: true,
              currentLimit: 3,
            });
          }
        }

        if (action === "WHATSAPP_CONNECT") {
          return res.status(403).json({
            error:
              "La automatización de mensajes por WhatsApp 2 vías requiere el Plan Pro (25€/mes).",
            requiresUpgrade: true,
          });
        }

        if (action === "CREATE_APPOINTMENT") {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const monthlyAppointmentsCount = await prisma.appointment.count({
            where: {
              businessId,
              appointmentDate: { gte: startOfMonth },
            },
          });

          if (monthlyAppointmentsCount >= 40) {
            return res.status(403).json({
              error:
                "Has alcanzado el límite de 40 citas este mes del Plan Básico (18€/mes). Actualiza a Plan Pro para citas ilimitadas.",
              requiresUpgrade: true,
              currentLimit: 40,
            });
          }
        }
      }

      return next();
    } catch (error) {
      console.error("Error en middleware checkSubscriptionLimits:", error);
      return res.status(500).json({ error: "Error interno al validar límites de suscripción." });
    }
  };
};
