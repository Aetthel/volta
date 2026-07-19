import * as demoService from '../services/demoService.js';
import { ApiResponse } from '../utils/index.js';

export const createDemo = async (req, res) => {
  const result = await demoService.createDemo();
  return ApiResponse.created(res, result);
};

export const deleteDemo = async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'businessId es requerido' });
  }

  const deleted = await demoService.deleteDemo(businessId);
  if (!deleted) {
    return res.status(404).json({ error: 'Demo no encontrado o no es un negocio demo' });
  }
  return ApiResponse.deleted(res);
};
