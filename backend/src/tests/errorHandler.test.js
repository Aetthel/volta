import { jest } from '@jest/globals';
import errorHandler from '../middleware/errorHandler.js';

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { originalUrl: '/test', method: 'GET' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle Prisma errors with 400', () => {
    const err = new Error('Unique constraint failed');
    err.name = 'PrismaClientKnownRequestError';
    err.code = 'P2002';
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Error en la base de datos' })
    );
  });

  it('should handle JSON parse errors with 400', () => {
    const err = new SyntaxError('Unexpected token');
    err.status = 400;
    err.body = {};
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Formato JSON no válido en el cuerpo de la petición',
    });
  });

  it('should handle custom errors with statusCode', () => {
    const err = new Error('Not found');
    err.statusCode = 404;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Not found' })
    );
  });

  it('should handle generic errors with 500', () => {
    const err = new Error('Something went wrong');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
