import { jest } from '@jest/globals';
import asyncHandler from '../utils/asyncHandler.js';

describe('asyncHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call the handler on success', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error on async rejection', async () => {
    const error = new Error('Async error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should call next with error on sync throw', async () => {
    const error = new Error('Thrown error');
    const handler = jest.fn().mockImplementation(() => { throw error; });
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
