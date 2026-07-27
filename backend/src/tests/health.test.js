import { jest } from "@jest/globals";
import request from "supertest";
import app from "../index.js";
import prisma from "../config/db.js";

describe("GET /health", () => {
  beforeEach(() => {
    jest.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 200 OK with status: ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("ok");
    expect(res.body.services).toBeDefined();
    expect(res.body.services.database).toEqual("connected");
  });
});
