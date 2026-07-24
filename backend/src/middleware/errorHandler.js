/**
 * Global Express error handling middleware.
 * Formats API errors and handles custom and DB-level (Prisma) exceptions.
 */
import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('[Global Error Handler]', {
    message: err.message,
    name: err.name,
    code: err.code,
    path: req.originalUrl,
    method: req.method,
  });

  // Prisma Specific Errors
  if (err.name === 'PrismaClientKnownRequestError' || (err.code && typeof err.code === 'string' && err.code.startsWith('P'))) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Ya existe un registro con esos datos (restricción de unicidad violada).',
          fields: err.meta?.target || []
        });
      case 'P2025':
        return res.status(404).json({
          error: 'El recurso solicitado no fue encontrado en la base de datos.'
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Violación de clave foránea en la base de datos.'
        });
      default:
        return res.status(400).json({
          error: 'Error en la operación de base de datos.',
          code: err.code
        });
    }
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Formato JSON no válido en el cuerpo de la petición.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor.' : (err.message || 'Error en la petición.'),
  });
};

export default errorHandler;
