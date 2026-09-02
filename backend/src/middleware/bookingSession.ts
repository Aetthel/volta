import type { Request, Response, NextFunction } from "express";
import { verifyBookingToken } from "../services/bookingIdentityService.js";

export interface BookingIdentity {
  phone: string;
  businessId: string;
  name?: string | null;
  fullName?: string | null;
  [key: string]: unknown;
}

export interface BookingRequest extends Request {
  bookingIdentity?: BookingIdentity;
}

/**
 * Exige una sesión de reserva verificada en el portal público.
 */
export const requireBookingSession = (
  req: BookingRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const token = req.header("x-booking-token");

  if (!token) {
    return res.status(401).json({
      error: "Verifica tu teléfono para continuar con la reserva.",
      code: "BOOKING_SESSION_REQUIRED",
    });
  }

  const businessId = req.params?.businessId || req.body?.businessId || null;
  const identity = verifyBookingToken(token, businessId) as BookingIdentity | null;

  if (!identity) {
    return res.status(401).json({
      error: "Tu sesión ha caducado. Vuelve a verificar tu teléfono.",
      code: "BOOKING_SESSION_INVALID",
    });
  }

  req.bookingIdentity = identity;
  return next();
};

export default requireBookingSession;
