import * as clientsService from '../services/clientsService.js';
import { ApiResponse } from '../utils/index.js';

export const getClients = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const clients = await clientsService.getClientsByBusiness(businessId);
  return ApiResponse.success(res, clients);
};

export const createClient = async (req, res) => {
  const { name, surname, email, phone, businessId } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const client = await clientsService.createClient({ name, surname, email, phone, businessId });
  return ApiResponse.created(res, client);
};

export const updateClient = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN') {
    const client = await clientsService.getClientById(id);
    if (!client || client.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this client' });
    }
  }

  const { name, surname, email, phone, lastVisit, frequentService } = req.body;
  const client = await clientsService.updateClient(id, { name, surname, email, phone, lastVisit, frequentService });
  return ApiResponse.success(res, client);
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN') {
    const client = await clientsService.getClientById(id);
    if (!client || client.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this client' });
    }
  }

  await clientsService.deleteClient(id);
  return ApiResponse.deleted(res);
};

export const resendConsent = async (req, res) => {
  const { id } = req.params;

  const client = await clientsService.getClientById(id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && client.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this client' });
  }

  await clientsService.resendConsent(client);
  return ApiResponse.ok(res);
};

export const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'El campo message es requerido y no puede estar vacío.' });
  }

  const client = await clientsService.getClientById(id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && client.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this client' });
  }

  await clientsService.sendMessage(client, message);
  return ApiResponse.ok(res);
};
