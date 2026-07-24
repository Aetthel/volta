import * as adminService from '../services/adminService.js';
import { ApiResponse } from '../utils/index.js';

export const getBusinesses = async (req, res) => {
  const businesses = await adminService.getAllBusinesses();
  return ApiResponse.success(res, businesses);
};

export const createBusiness = async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  const business = await adminService.createBusiness({
    name,
    email,
    phone,
    address
  }, password);

  return ApiResponse.created(res, business);
};

export const deleteBusiness = async (req, res) => {
  const { id } = req.params;
  const business = await adminService.getAllBusinesses();
  const exists = business.some(b => b.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }
  await adminService.deleteBusiness(id);
  return ApiResponse.deleted(res);
};

export const getDashboard = async (req, res) => {
  const data = await adminService.getDashboardData();
  return ApiResponse.success(res, data);
};
