import { vi, describe, it, expect, beforeEach } from "vitest";
import asyncHandler from "../utils/asyncHandler.js";

describe("asyncHandler", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = {};
    res = {};
    next = vi.fn();
  });

  it("should call the handler on success", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with error on async rejection", async () => {
    const error = new Error("Async error");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should call next with error on sync throw", async () => {
    const error = new Error("Thrown error");
    const handler = vi.fn().mockImplementation(() => {
      throw error;
    });
    const wrapped = asyncHandler(handler);
    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
