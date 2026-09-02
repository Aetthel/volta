import type { Request } from "express";

export type UserRole = "ADMIN" | "JEFE" | "EMPLEADO";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  businessId?: string | null;
  emailVerified?: boolean | null;
  status?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  businessId?: string;
  sessionToken?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
