import * as userService from "../services/userService.js";
import { ApiResponse } from "../utils/index.js";
import prisma from "../config/db.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import authSecurityService from "../services/authSecurityService.js";

export const getUsers = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { businessId } = req.query as { businessId?: string };
  const where: any = {};

  if (businessId && businessId !== "null" && businessId !== "undefined") {
    where.businessId = businessId;
  }

  // Force non-admins to only query their own business
  if (req.user?.role !== "ADMIN") {
    where.businessId = req.user?.businessId || "no_business";
  }

  const users = await userService.getUsers(where);

  return ApiResponse.success(res, users);
};

export const createUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { name, email, password, role, businessId } = req.body;

  // Check tenant isolation
  if (req.user.role !== "ADMIN") {
    if (businessId && businessId !== req.user.businessId) {
      return res.status(403).json({ error: "Acceso denegado a otro negocio" });
    }
    if (role === "ADMIN") {
      return res.status(403).json({ error: "No se pueden crear usuarios ADMIN" });
    }
  }

  // Check if email already exists
  const existing = await userService.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "El correo electrónico ya está registrado." });
  }

  const user = await userService.createUser({
    name,
    email,
    password,
    role: role || "EMPLEADO",
    businessId: (req.user.role !== "ADMIN" ? req.user.businessId : businessId) || null,
  });

  const { password: _, ...sanitized } = user;
  return ApiResponse.created(res, sanitized);
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.params as { id: string };
  const { name, email, password, role, businessId } = req.body;

  // If not admin, check target user ownership and request params
  if (req.user.role !== "ADMIN") {
    const targetUser = await userService.getUserById(id);
    if (!targetUser || targetUser.businessId !== req.user.businessId) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    if (businessId !== undefined && businessId !== req.user.businessId) {
      return res.status(403).json({ error: "No se puede transferir usuario a otro negocio" });
    }
  }

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined && email !== null) {
    const cleanEmail = (email as string).trim().toLowerCase();
    // Check if email taken by someone else
    const existing = await userService.getUserByEmail(cleanEmail);
    if (existing && existing.id !== id) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado por otro usuario." });
    }
    data.email = cleanEmail;
  }
  if (password !== undefined && password !== null && password !== "") {
    data.password = password;
  }
  if (role !== undefined) {
    if (role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "No se puede asignar el rol ADMIN." });
    }
    if (req.user.role !== "ADMIN" && req.user.role !== "JEFE") {
      return res.status(403).json({ error: "No tienes permisos para modificar roles." });
    }
    data.role = role;
  }
  if (businessId !== undefined && req.user.role === "ADMIN") {
    data.businessId = businessId;
  }

  const updated = await userService.updateUser(id, data);

  const { password: _, ...sanitized } = updated;
  return ApiResponse.success(res, sanitized);
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.params as { id: string };

  // If not admin, check target user ownership
  if (req.user.role !== "ADMIN") {
    const targetUser = await userService.getUserById(id);
    if (!targetUser || targetUser.businessId !== req.user.businessId) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
  }

  await userService.deleteUser(id);
  return ApiResponse.deleted(res);
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, businessName, phone, businessType } = req.body;
  const cleanEmail = email ? (email as string).trim().toLowerCase() : "";

  if (!cleanEmail) {
    return res.status(400).json({ error: "El correo electrónico es requerido." });
  }

  // 1. Check if user email already exists (case-insensitive)
  const existingUser = await userService.getUserByEmail(cleanEmail);
  if (existingUser) {
    return res.status(400).json({ error: "El correo electrónico ya está registrado." });
  }

  // 2. Create Business and JEFE User atomically in a transaction
  const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const hashedPassword = await userService.hashPassword(password || "");

  const { business, user } = await prisma.$transaction(async (tx: any) => {
    const createdBusiness = await tx.business.create({
      data: {
        name: businessName,
        phone,
        email: cleanEmail,
        businessType: businessType || "Peluquería / Barbería",
        subscriptionPlan: "PRO",
        subscriptionStatus: "TRIALING",
        trialExpiresAt,
        users: {
          create: {
            name,
            email: cleanEmail,
            password: hashedPassword,
            role: "JEFE",
            status: "PENDING_VERIFICATION",
          },
        },
      },
      include: {
        users: true,
      },
    });

    let createdUser = createdBusiness?.users?.[0];
    if (!createdUser && tx.user?.create) {
      createdUser = await tx.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          role: "JEFE",
          status: "PENDING_VERIFICATION",
          businessId: createdBusiness.id,
        },
      });
    }

    return { business: createdBusiness, user: createdUser };
  });

  // Automatically trigger email OTP verification code.
  let emailSent = false;
  try {
    const delivery = await authSecurityService.sendUserVerificationOtp(user);
    emailSent = Boolean(delivery.emailSent);
  } catch (otpErr) {
    console.error("[UserController] Error sending initial OTP email:", otpErr);
  }

  const { password: _, ...sanitizedUser } = user;

  return ApiResponse.created(res, {
    user: sanitizedUser,
    verificationRequired: true,
    emailSent,
    business: {
      id: business.id,
      name: business.name,
      businessType: business.businessType,
      subscriptionPlan: business.subscriptionPlan,
      subscriptionStatus: business.subscriptionStatus,
      trialExpiresAt: business.trialExpiresAt,
    },
  });
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
};
