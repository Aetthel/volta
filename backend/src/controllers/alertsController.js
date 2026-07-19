import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

// GET: Fetch all alerts for the authenticated user
export const getAlerts = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado: ID de usuario faltante' });
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(alerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT: Mark a specific alert as read
export const markAlertAsRead = async (req, res) => {
  const userId = req.user?.id;
  const alertId = req.params.id;

  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    // Check ownership first
    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: 'Alerta no encontrada o no autorizado' });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true }
    });

    return res.json(updatedAlert);
  } catch (error) {
    logger.error('Error marking alert as read:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT: Mark all user alerts as read
export const markAllAlertsAsRead = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    logger.error('Error marking all alerts as read:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST: Create alerts (Admin broadcast or backend triggers)
export const createAlert = async (req, res) => {
  const { type, title, description, targetUserId, targetBusinessId, targetRole } = req.body;

  try {
    let where = {};

    if (req.user?.role === 'ADMIN') {
      // Admin can target any user across any business
      if (targetUserId) where.id = targetUserId;
      if (targetBusinessId) where.businessId = targetBusinessId;
      if (targetRole) where.role = targetRole;
    } else {
      // Non-admin: always scope to their own business, ignore targetBusinessId
      where.businessId = req.user?.businessId;
      if (targetUserId) where.id = targetUserId;
      if (targetRole) where.role = targetRole;
    }

    const users = await prisma.user.findMany({ where });

    if (users.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios objetivo' });
    }

    const createdAlerts = await Promise.all(
      users.map((u) =>
        prisma.alert.create({
          data: {
            type,
            title,
            description,
            userId: u.id,
            isRead: false
          }
        })
      )
    );

    return res.status(201).json({ success: true, count: createdAlerts.length });
  } catch (error) {
    logger.error('Error creating alert:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
