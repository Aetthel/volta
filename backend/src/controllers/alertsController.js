import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

// GET: Fetch all alerts for the authenticated user
export const getAlerts = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(alerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT: Mark a specific alert as read
export const markAlertAsRead = async (req, res) => {
  const userId = req.user?.id;
  const alertId = req.params.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check ownership first
    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ error: 'Alert not found or unauthorized' });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true }
    });

    return res.json(updatedAlert);
  } catch (error) {
    logger.error('Error marking alert as read:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT: Mark all user alerts as read
export const markAllAlertsAsRead = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    logger.error('Error marking all alerts as read:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST: Create alerts (Admin broadcast or backend triggers)
export const createAlert = async (req, res) => {
  const { type, title, description, targetUserId, targetBusinessId, targetRole } = req.body;

  if (!type || !title || !description) {
    return res.status(400).json({ error: 'Type, title, and description are required' });
  }

  // Non-admins can only create alerts for themselves or users of their own business
  if (req.user?.role !== 'ADMIN') {
    if (targetBusinessId && targetBusinessId !== req.user?.businessId) {
      return res.status(403).json({ error: 'Forbidden: Cannot create alerts for other businesses' });
    }
  }

  try {
    const where = {};
    if (targetUserId) where.id = targetUserId;
    if (targetBusinessId) where.businessId = targetBusinessId;
    if (targetRole) where.role = targetRole;

    // Enforce business constraint for non-admins if target filters are vague
    if (req.user?.role !== 'ADMIN' && !targetUserId && !targetBusinessId) {
      where.businessId = req.user?.businessId;
    }

    const users = await prisma.user.findMany({ where });

    if (users.length === 0) {
      return res.status(404).json({ error: 'No matching target users found' });
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
