import type { Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/db.js";
import type { AuthRequest } from "../types/index.js";

export type SubscriptionAction =
  | "CREATE_LOCATION"
  | "INVITE_MEMBER"
  | "INVITE_WORKER"
  | "WHATSAPP_CONNECT"
  | "ONLINE_PAYMENTS"
  | "CREATE_APPOINTMENT"
  | "CREATE_PUBLIC_BOOKING";

export const checkSubscriptionLimits = (action: SubscriptionAction): RequestHandler => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
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

      // If user is on TRIALING or ENTERPRISE, features are unlimited during trial
      if (business.subscriptionStatus === "TRIALING" || business.subscriptionPlan === "ENTERPRISE") {
        return next();
      }

      // Plan PRO Limits (40€/mes)
      if (business.subscriptionPlan === "PRO") {
        // Pro includes unlimited locations, unlimited appointments, whatsapp 2-way, payments, etc.
        return next();
      }

      // Plan BASIC Limits (30€/mes)
      if (business.subscriptionPlan === "BASIC") {
        if (action === "CREATE_LOCATION") {
          return res.status(403).json({
            error:
              "El Plan Básico (30€/mes) permite 1 sola sede o calendario. Actualiza a Plan Pro para sedes y multi-calendario ilimitado.",
            requiresUpgrade: true,
            currentLimit: 1,
          });
        }

        if (action === "INVITE_MEMBER" || action === "INVITE_WORKER") {
          const userCount = business._count?.users || 0;
          if (userCount >= 1) {
            return res.status(403).json({
              error:
                "El Plan Básico (30€/mes) incluye 1 trabajador. Añade trabajadores adicionales (+5€/mes) o actualiza al Plan Pro (40€/mes).",
              requiresUpgrade: true,
              currentLimit: 1,
              extraWorkerPrice: 5,
            });
          }
        }

        if (action === "WHATSAPP_CONNECT") {
          return res.status(403).json({
            error:
              "La automatización y el bot interactivo de WhatsApp 2 vías requiere el Plan Pro (40€/mes).",
            requiresUpgrade: true,
          });
        }

        if (action === "ONLINE_PAYMENTS") {
          return res.status(403).json({
            error:
              "El cobro de señas y depósitos online requiere el Plan Pro (40€/mes).",
            requiresUpgrade: true,
          });
        }

        if (action === "CREATE_APPOINTMENT" || action === "CREATE_PUBLIC_BOOKING") {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const monthlyAppointmentsCount = await prisma.appointment.count({
            where: {
              businessId,
              appointmentDate: { gte: startOfMonth },
            },
          });

          if (monthlyAppointmentsCount >= 100) {
            return res.status(403).json({
              error:
                "Has alcanzado el límite de 100 reservas este mes del Plan Básico (30€/mes). Actualiza a Plan Pro para reservas ilimitadas.",
              requiresUpgrade: true,
              currentLimit: 100,
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

export default { checkSubscriptionLimits };
