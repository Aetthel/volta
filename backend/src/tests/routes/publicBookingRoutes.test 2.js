import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../index.js";
import prisma from "../../config/db.js";

describe("POST /api/public/booking/reserve", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 validation error if mandatory fields are missing", async () => {
    const res = await request(app).post("/api/public/booking/reserve").send({
      clientName: "Ana",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 404 if target business is not found", async () => {
    jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);

    const res = await request(app)
      .post("/api/public/booking/reserve")
      .send({
        businessId: "non-existing-b",
        serviceId: "s1",
        clientName: "Ana García",
        clientPhone: "+34 600 111 222",
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Negocio no encontrado");
  });
});
