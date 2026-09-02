import prisma from "../config/db.js";
import { logger } from "../utils/logger.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

// GET: Fetch alerts for the authenticated user with category & archive filters
export const getAlerts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado: ID de usuario faltante" });
  }

  const { category, archived, unreadOnly, search } = req.query as Record<string, string | undefined>;

  try {
    // Check if user's business is in trial mode and evaluate milestone alerts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (user?.business?.subscriptionStatus === "TRIALING" && user?.business?.trialExpiresAt) {
      const expiresDate = new Date(user.business.trialExpiresAt);
      const diffMs = expiresDate.getTime() - Date.now();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (daysLeft <= 3 && daysLeft > 0) {
        const title = `Prueba Plan Pro: ${daysLeft} día${daysLeft === 1 ? "" : "s"} restante${daysLeft === 1 ? "" : "s"}`;
        const existing = await prisma.alert.findFirst({
          where: { userId, title },
        });
        if (!existing) {
          await prisma.alert.create({
            data: {
              type: "AVISO",
              category: "BILLING",
              title,
              description:
                "Tu período de prueba gratuita del Plan Pro finaliza pronto. Elige tu plan en Ajustes para mantener todas las funciones activas.",
              actionUrl: "/ajustes",
              actionLabel: "Elegir Plan",
              userId,
              businessId: user.businessId,
              isRead: false,
            },
          });
        }
      } else if (daysLeft === 0) {
        const title = "Período de prueba gratuita finalizado";
        const existing = await prisma.alert.findFirst({
          where: { userId, title },
        });
        if (!existing) {
          await prisma.alert.create({
            data: {
              type: "AVISO",
              category: "BILLING",
              title,
              description:
                "Tu prueba de 10 días ha expirado. Elige el Plan Base (18€/mes) o Plan Pro (25€/mes) para continuar utilizando Volta.",
              actionUrl: "/ajustes",
              actionLabel: "Elegir Plan",
              userId,
              businessId: user.businessId,
              isRead: false,
            },
          });
        }
      }
    }

    const where: any = {
      userId,
    };

    if (archived === "true") {
      where.isArchived = true;
    } else if (archived === "all") {
      // Don't filter by isArchived
    } else {
      where.isArchived = false;
    }

    if (category && category !== "TODAS" && category !== "ALL") {
      where.category = category;
    }

    if (unreadOnly === "true") {
      where.isRead = false;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.json(alerts);
  } catch (error) {
    logger.error("Error fetching alerts:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// GET: Summary count per category and unread totals
export const getAlertSummary = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { userId, isArchived: false },
      select: { category: true, isRead: true },
    });

    const summary = {
      total: alerts.length,
      unreadTotal: alerts.filter((a) => !a.isRead).length,
      categories: {
        TODAS: alerts.length,
        APPOINTMENT: alerts.filter((a) => a.category === "APPOINTMENT").length,
        WHATSAPP: alerts.filter((a) => a.category === "WHATSAPP").length,
        CLIENT: alerts.filter((a) => a.category === "CLIENT").length,
        BILLING: alerts.filter((a) => a.category === "BILLING").length,
        SYSTEM: alerts.filter((a) => a.category === "SYSTEM").length,
      },
      unreadCategories: {
        TODAS: alerts.filter((a) => !a.isRead).length,
        APPOINTMENT: alerts.filter((a) => a.category === "APPOINTMENT" && !a.isRead).length,
        WHATSAPP: alerts.filter((a) => a.category === "WHATSAPP" && !a.isRead).length,
        CLIENT: alerts.filter((a) => a.category === "CLIENT" && !a.isRead).length,
        BILLING: alerts.filter((a) => a.category === "BILLING" && !a.isRead).length,
        SYSTEM: alerts.filter((a) => a.category === "SYSTEM" && !a.isRead).length,
      },
    };

    return res.json(summary);
  } catch (error) {
    logger.error("Error fetching alerts summary:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT: Mark a specific alert as read
export const markAlertAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const alertId = req.params.id as string;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: "Alerta no encontrada o no autorizado" });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });

    return res.json(updatedAlert);
  } catch (error) {
    logger.error("Error marking alert as read:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT: Mark all user alerts as read (optionally by category)
export const markAllAlertsAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { category } = req.query as { category?: string };

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const where: any = { userId, isRead: false };
    if (category && category !== "TODAS" && category !== "ALL") {
      where.category = category;
    }

    await prisma.alert.updateMany({
      where,
      data: { isRead: true },
    });
    return res.json({ success: true, message: "Todas las alertas marcadas como leídas" });
  } catch (error) {
    logger.error("Error marking all alerts as read:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT: Archive a specific alert
export const archiveAlert = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const alertId = req.params.id as string;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: "Alerta no encontrada o no autorizado" });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { isArchived: true },
    });

    return res.json(updatedAlert);
  } catch (error) {
    logger.error("Error archiving alert:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT: Unarchive a specific alert
export const unarchiveAlert = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const alertId = req.params.id as string;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: "Alerta no encontrada o no autorizado" });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { isArchived: false },
    });

    return res.json(updatedAlert);
  } catch (error) {
    logger.error("Error unarchiving alert:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// DELETE: Delete a specific alert
export const deleteAlert = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const alertId = req.params.id as string;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: "Alerta no encontrada o no autorizado" });
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return res.json({ success: true, message: "Alerta eliminada correctamente" });
  } catch (error) {
    logger.error("Error deleting alert:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST: Create alerts (Admin broadcast or backend triggers)
export const createAlert = async (req: AuthRequest, res: Response) => {
  const {
    type,
    category = "SYSTEM",
    title,
    description,
    actionUrl,
    actionLabel,
    targetUserId,
    targetBusinessId,
    targetRole,
  } = req.body;

  try {
    const where: any = {};

    if (req.user?.role === "ADMIN") {
      if (targetUserId) where.id = targetUserId;
      if (targetBusinessId) where.businessId = targetBusinessId;
      if (targetRole) where.role = targetRole;
    } else {
      where.businessId = req.user?.businessId;
      if (targetUserId) where.id = targetUserId;
      if (targetRole) where.role = targetRole;
    }

    const users = await prisma.user.findMany({ where });

    if (users.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios objetivo" });
    }

    const createdAlerts = await Promise.all(
      users.map((u) =>
        prisma.alert.create({
          data: {
            type,
            category,
            title,
            description,
            actionUrl: actionUrl || null,
            actionLabel: actionLabel || null,
            userId: u.id,
            businessId: u.businessId,
            isRead: false,
          },
        })
      )
    );

    return res.status(201).json({ success: true, count: createdAlerts.length });
  } catch (error) {
    logger.error("Error creating alert:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
