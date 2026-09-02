import type { Response } from "express";

/**
 * Unified API Response Helper.
 * Preserves the exact response formats to avoid breaking the frontend.
 */
export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json(data);
  }

  static created<T>(res: Response, data: T): Response {
    return res.status(201).json(data);
  }

  static deleted(res: Response): Response {
    return res.status(200).json({ success: true });
  }

  static ok(res: Response): Response {
    return res.status(200).json({ success: true });
  }
}

export default ApiResponse;
