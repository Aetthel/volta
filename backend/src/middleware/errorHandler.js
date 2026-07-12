/**
 * Global Express error handling middleware.
 * Formats API errors and handles custom and DB-level (Prisma) exceptions.
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for server logs
  console.error('[Global Error Handler]', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle Prisma connection or query exceptions
  if (err.name === 'PrismaClientKnownRequestError' || (err.code && err.code.startsWith('P'))) {
    return res.status(400).json({
      error: 'Error en la base de datos',
      code: err.code,
      details: process.env.NODE_ENV === 'production' ? null : err.message,
    });
  }

  // Handle JSON parsing errors (from express.json() parser)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Formato JSON no válido en el cuerpo de la petición' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
