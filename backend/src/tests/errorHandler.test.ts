import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import errorHandler from "../middleware/errorHandler.js";

describe("errorHandler middleware", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { originalUrl: "/test", method: "GET" };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle Prisma P2002 errors with 409 Conflict", () => {
    const err: any = new Error("Unique constraint failed");
    err.name = "PrismaClientKnownRequestError";
    err.code = "P2002";
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("unicidad") })
    );
  });

  it("should handle JSON parse errors with 400", () => {
    const err: any = new SyntaxError("Unexpected token");
    err.status = 400;
    err.body = {};
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Formato JSON no válido en el cuerpo de la petición.",
    });
  });

  it("should handle custom errors with statusCode", () => {
    const err: any = new Error("Not found");
    err.statusCode = 404;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Not found",
    });
  });

  it("should handle generic errors with 500", () => {
    const err: any = new Error("Something went wrong");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
