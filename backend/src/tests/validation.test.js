import { jest } from "@jest/globals";
import { isValidId, validateId, validateBody } from "../middleware/validation.js";
import { z } from "zod";

describe("isValidId", () => {
  it("should return true for valid alphanumeric IDs", () => {
    expect(isValidId("abc123")).toBe(true);
    expect(isValidId("test-id")).toBe(true);
    expect(isValidId("user_name")).toBe(true);
  });

  it("should return false for invalid IDs", () => {
    expect(isValidId("")).toBe(false);
    expect(isValidId("id with spaces")).toBe(false);
    expect(isValidId("id/with/slashes")).toBe(false);
    expect(isValidId("id.with.dots")).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId(123)).toBe(false);
  });
});

describe("validateId", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next for valid ID in params", () => {
    req.params.businessId = "valid-id-123";
    validateId("businessId")(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 for missing ID", () => {
    validateId("businessId")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or missing parameter: businessId",
    });
  });

  it("should return 400 for invalid ID", () => {
    req.params.businessId = "invalid id!";
    validateId("businessId")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateBody", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next for valid body", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    req.body = { name: "Test", age: 25 };
    validateBody(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 for invalid body", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    req.body = { name: "Test", age: "not-a-number" };
    validateBody(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Validation failed" }));
  });
});
