/**
 * Custom application operational error class.
 * Differentiates operational errors from programmer/unexpected errors.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} [statusCode=500] - HTTP status code
   * @param {any} [details=null] - Additional error details or field violations
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Solicitud incorrecta", details = null) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "No autorizado", details = null) {
    return new AppError(message, 401, details);
  }

  static forbidden(message = "Acceso denegado", details = null) {
    return new AppError(message, 403, details);
  }

  static notFound(message = "Recurso no encontrado", details = null) {
    return new AppError(message, 404, details);
  }

  static conflict(message = "Conflicto con el estado actual del recurso", details = null) {
    return new AppError(message, 409, details);
  }

  static internal(message = "Error interno del servidor", details = null) {
    return new AppError(message, 500, details);
  }
}

export default AppError;
