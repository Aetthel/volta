import * as lopdService from '../services/lopdService.js';
import { computeHmac } from '../utils/index.js';
import config from '../config/index.js';
import { ApiResponse } from '../utils/index.js';

const verifyToken = (id, token) => {
  const expectedToken = computeHmac(id, config.backendJwtSecret);
  return token && token === expectedToken;
};

export const getConsent = async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  if (!verifyToken(id, token)) {
    return res.status(400).json({ error: 'Invalid or missing signature token.' });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  return ApiResponse.success(res, {
    clientName: client.name,
    businessName: client.business.name,
    lopdStatus: client.lopdStatus
  });
};

export const acceptConsent = async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  if (!verifyToken(id, token)) {
    return res.status(400).json({ error: 'Invalid or missing signature token.' });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // Idempotencia — ya aceptado, nada que hacer
  if (client.lopdStatus === 'Aceptado') {
    console.log(`[API] Client ${client.name} already accepted LOPD. Skipping.`);
    return ApiResponse.success(res, { success: true, client });
  }

  const { updatedClient } = await lopdService.acceptConsent(id);

  console.log(`[API] Client ${client.name} (${client.phone}) accepted LOPD consent. Status updated to Aceptado.`);

  return ApiResponse.success(res, { success: true, client: updatedClient });
};
