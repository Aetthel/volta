import { jest } from "@jest/globals";
import { authenticate, requireRole } from "../middleware/auth.js";
import { signToken } from "../utils/crypto.js";

const MOCK_API_KEY = process.env.API_KEY || "test-api-key";
const MOCK_JWT_SECRET = process.env.BACKEND_JWT_SECRET || "test-jwt-secret";

describe("authenticate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn(), user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 401 if API key is missing", async () => {
    req.header.mockReturnValue(undefined);
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acceso no autorizado: API Key inválida o ausente",
    });
  });

  it("should return 401 if API key is invalid", async () => {
    req.header.mockImplementation((name) => {
      if (name === "x-api-key") return "wrong-key";
      return undefined;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 if JWT token is invalid", async () => {
    req.header.mockImplementation((name) => {
      if (name === "x-api-key") return MOCK_API_KEY;
      if (name === "Authorization") return "Bearer invalid-token";
      return undefined;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acceso no autorizado: Token inválido o expirado",
    });
  });

  it("should return 401 if API key is valid but no JWT token", async () => {
    req.header.mockImplementation((name) => {
      if (name === "x-api-key") return MOCK_API_KEY;
      return undefined;
    });
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acceso no autorizado: Token no proporcionado",
    });
  });

  it("should call next with valid API key and valid JWT token", async () => {
    const payload = { id: "user-1", role: "ADMIN", businessId: "biz-1", email: "admin@test.com" };
    const token = signToken(payload, MOCK_JWT_SECRET);
    req.header.mockImplementation((name) => {
      if (name === "x-api-key") return MOCK_API_KEY;
      if (name === "Authorization") return `Bearer ${token}`;
      return undefined;
    });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      id: "user-1",
      role: "ADMIN",
      businessId: "biz-1",
      email: "admin@test.com",
    });
  });
});

describe("requireRole middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 403 if user has no role", () => {
    req.user = { role: null };
    requireRole(["ADMIN"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acceso denegado: Permisos insuficientes",
      code: "PERMISSIONS_REVOKED",
      redirect: "/",
    });
  });

  it("should return 403 if user role is not allowed", () => {
    req.user = { role: "EMPLEADO" };
    requireRole(["ADMIN"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should return 403 when EMPLEADO attempts access to JEFE/ADMIN restricted route", () => {
    req.user = { role: "EMPLEADO" };
    requireRole(["ADMIN", "JEFE"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user role is allowed", () => {
    req.user = { role: "ADMIN" };
    requireRole(["ADMIN", "JEFE"])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
