import * as lopdService from '../services/lopdService.js';
import { computeHmac } from '../utils/index.js';
import config from '../config/index.js';
import { ApiResponse } from '../utils/index.js';
import crypto from 'crypto';

const verifyToken = (id, token, exp) => {
  if (!token || !id || !exp) return false;
  const expiry = parseInt(exp, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  const tokenData = `${id}:${expiry}`;
  const expectedToken = computeHmac(tokenData, config.lopdHmacSecret);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch {
    return false;
  }
};

export const getConsent = async (req, res) => {
  const { id } = req.params;
  const token = req.headers['x-lopd-token'];
  const exp = req.headers['x-lopd-exp'];

  if (!verifyToken(id, token, exp)) {
    return res.status(400).json({ error: 'Token de firma inválido, faltante o expirado.' });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  return ApiResponse.success(res, {
    clientName: client.name,
    businessName: client.business.name,
    lopdStatus: client.lopdStatus
  });
};

export const acceptConsent = async (req, res) => {
  const { id } = req.params;
  const token = req.headers['x-lopd-token'];
  const exp = req.headers['x-lopd-exp'];

  if (!verifyToken(id, token, exp)) {
    return res.status(400).json({ error: 'Token de firma inválido, faltante o expirado.' });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  // Idempotencia — ya aceptado, nada que hacer
  if (client.lopdStatus === 'Aceptado') {
    return ApiResponse.success(res, { success: true, client });
  }

  const { updatedClient } = await lopdService.acceptConsent(id);

  return ApiResponse.success(res, { success: true, client: updatedClient });
};
