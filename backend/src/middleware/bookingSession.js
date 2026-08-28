import { verifyBookingToken } from "../services/bookingIdentityService.js";

/**
 * Exige una sesión de reserva verificada en el portal público.
 *
 * El negocio se toma de `req.params.businessId` cuando la ruta lo lleva, y del
 * cuerpo cuando no (el caso de `POST /reserve`). El token solo vale para el
 * negocio para el que se emitió: sin esa comprobación, un token legítimo de un
 * negocio abriría el catálogo de cualquier otro.
 */
export const requireBookingSession = (req, res, next) => {
  const token = req.header("x-booking-token");

  if (!token) {
    return res.status(401).json({
      error: "Verifica tu teléfono para continuar con la reserva.",
      code: "BOOKING_SESSION_REQUIRED",
    });
  }

  const businessId = req.params?.businessId || req.body?.businessId || null;
  const identity = verifyBookingToken(token, businessId);

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
