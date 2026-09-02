import * as adminService from "../services/adminService.js";
import { ApiResponse } from "../utils/index.js";
import type { Request, Response } from "express";

export const getBusinesses = async (_req: Request, res: Response) => {
  const businesses = await adminService.getAllBusinesses();
  return ApiResponse.success(res, businesses);
};

export const createBusiness = async (req: Request, res: Response) => {
  const { name, email, phone, address, password } = req.body;

  const business = await adminService.createBusiness(
    {
      name,
      email,
      phone,
      address,
    },
    password
  );

  return ApiResponse.created(res, business);
};

export const deleteBusiness = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const business = await adminService.getAllBusinesses();
  const exists = business.some((b) => b.id === id);
  if (!exists) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }
  await adminService.deleteBusiness(id);
  return ApiResponse.deleted(res);
};

export const getDashboard = async (_req: Request, res: Response) => {
  const data = await adminService.getDashboardData();
  return ApiResponse.success(res, data);
};

export default {
  getBusinesses,
  createBusiness,
  deleteBusiness,
  getDashboard,
};
