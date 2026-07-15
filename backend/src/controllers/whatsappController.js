import whatsappManager from '../services/whatsappService.js';
import prisma from '../config/db.js';
import { ApiResponse } from '../utils/index.js';
import { logger } from '../utils/logger.js';

export const initClient = async (req, res) => {
  const { businessId } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  await whatsappManager.initClient(businessId);
  return ApiResponse.success(res, { message: 'WhatsApp initialization started' });
};

export const getStatus = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      whatsappStatus: true,
      qrCode: true
    }
  });

  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  return ApiResponse.success(res, {
    status: business.whatsappStatus,
    qrCode: business.qrCode
  });
};

export const disconnectClient = async (req, res) => {
  const { businessId } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const client = whatsappManager.getClient(businessId);
  if (client) {
    try {
      await client.destroy();
    } catch (destroyErr) {
      logger.error('[API] Warning: error during client destroy:', destroyErr);
    }
    whatsappManager.clients.delete(businessId);
  }
  whatsappManager.deleteSession(businessId);
  await whatsappManager.updateStatus(businessId, 'DISCONNECTED', null);
  return ApiResponse.success(res, { message: 'WhatsApp disconnected successfully' });
};

export const getTemplates = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      welcomeMessage: true,
      reminderMessage: true
    }
  });

  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  return ApiResponse.success(res, {
    welcomeMessage: business.welcomeMessage,
    reminderMessage: business.reminderMessage
  });
};

export const updateTemplates = async (req, res) => {
  const { businessId, welcomeMessage, reminderMessage } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      welcomeMessage,
      reminderMessage
    },
    select: {
      welcomeMessage: true,
      reminderMessage: true
    }
  });

  return ApiResponse.success(res, updated);
};
