import * as catalogService from '../services/catalogService.js';
import prisma from '../config/db.js';
import { ApiResponse } from '../utils/index.js';

export const getServices = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const services = await catalogService.getServicesByBusiness(businessId, true);
  return ApiResponse.success(res, services);
};

export const createService = async (req, res) => {
  const { businessId, name, description, duration, price } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const service = await catalogService.createService({
    businessId,
    name,
    description,
    duration,
    price
  });

  return ApiResponse.created(res, service);
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, duration, price, isActive } = req.body;

  const service = await catalogService.getServiceById(id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && service.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this service' });
  }

  const updated = await catalogService.updateService(id, {
    name,
    description,
    duration,
    price,
    isActive
  });

  return ApiResponse.success(res, updated);
};

export const deleteService = async (req, res) => {
  const { id } = req.params;

  const service = await catalogService.getServiceById(id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && service.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this service' });
  }

  await catalogService.softDeleteService(id);
  return ApiResponse.deleted(res);
};
