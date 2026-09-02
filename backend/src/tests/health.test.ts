import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import app from "../index.js";
import prisma from "../config/db.js";

describe("GET /health", () => {
  beforeEach(() => {
    vi.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 200 OK with status: ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("ok");
    expect(res.body.services).toBeDefined();
    expect(res.body.services.database).toEqual("connected");
  });
});
