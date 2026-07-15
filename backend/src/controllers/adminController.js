import * as adminService from '../services/adminService.js';
import { ApiResponse } from '../utils/index.js';
import bcrypt from 'bcryptjs';

export const getBusinesses = async (req, res) => {
  const businesses = await adminService.getAllBusinesses();
  return ApiResponse.success(res, businesses);
};

export const createBusiness = async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);

  const business = await adminService.createBusiness({
    name,
    email,
    phone,
    address
  }, hashedPass);

  return ApiResponse.success(res, business);
};

export const deleteBusiness = async (req, res) => {
  const { id } = req.params;
  const business = await adminService.getAllBusinesses();
  const exists = business.some(b => b.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Business not found' });
  }
  await adminService.deleteBusiness(id);
  return ApiResponse.deleted(res);
};

export const getDashboard = async (req, res) => {
  const data = await adminService.getDashboardData();
  return ApiResponse.success(res, data);
};
