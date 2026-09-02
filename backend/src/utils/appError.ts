/**
 * Custom application operational error class.
 * Differentiates operational errors from programmer/unexpected errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;
  public details: unknown;

  constructor(message: string, statusCode = 500, details: unknown = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Solicitud incorrecta", details: unknown = null): AppError {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "No autorizado", details: unknown = null): AppError {
    return new AppError(message, 401, details);
  }

  static forbidden(message = "Acceso denegado", details: unknown = null): AppError {
    return new AppError(message, 403, details);
  }

  static notFound(message = "Recurso no encontrado", details: unknown = null): AppError {
    return new AppError(message, 404, details);
  }

  static conflict(message = "Conflicto con el estado actual del recurso", details: unknown = null): AppError {
    return new AppError(message, 409, details);
  }

  static internal(message = "Error interno del servidor", details: unknown = null): AppError {
    return new AppError(message, 500, details);
  }
}

export default AppError;
