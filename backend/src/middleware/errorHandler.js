/**
 * Global Express error handling middleware.
 * Formats API errors and handles custom and DB-level (Prisma) exceptions.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]', {
    message: err.message,
    name: err.name,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.name === 'PrismaClientKnownRequestError' || (err.code && err.code.startsWith('P'))) {
    return res.status(400).json({
      error: 'Error en la base de datos',
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Formato JSON no válido en el cuerpo de la petición' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor' : 'Error en la petición',
  });
};

export default errorHandler;
