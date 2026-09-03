import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../index.js";
import prisma from "../../config/db.js";

describe("POST /api/users/register", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test",
      password: "password123",
      businessName: "Test Biz",
      phone: "+34 600 000 000",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 400 if email is already taken", async () => {
    jest
      .spyOn(prisma.user, "findFirst")
      .mockResolvedValue({ id: "u1", email: "existing@volta.es" });

    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "existing@volta.es",
      password: "password123",
      businessName: "Existing Biz",
      phone: "+34 600 000 000",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("registrado");
  });

  it("should return 201 Created and return sanitized user and business on successful registration", async () => {
    const createUser = jest.fn().mockResolvedValue({
      id: "u-new",
      name: "New Owner",
      email: "newowner@volta.es",
      role: "JEFE",
      businessId: "b-new",
      status: "PENDING_VERIFICATION",
      password: "hashedpassword",
    });

    jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
      return cb({
        business: {
          create: jest.fn().mockResolvedValue({
            id: "b-new",
            name: "New Salon",
            businessType: "Peluquería / Barbería",
            subscriptionPlan: "PRO",
            subscriptionStatus: "TRIALING",
            trialExpiresAt: new Date(),
          }),
        },
        user: { create: createUser },
      });
    });

    const res = await request(app).post("/api/users/register").send({
      name: "New Owner",
      email: "newowner@volta.es",
      password: "password123",
      businessName: "New Salon",
      phone: "+34 600 000 000",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.business).toBeDefined();
    expect(res.body.business.name).toBe("New Salon");

    // El alta pública nace pendiente: hasta introducir el código, `authorize()`
    // no abre sesión. Es lo que impide saltarse la pantalla de verificación.
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PENDING_VERIFICATION" }),
      })
    );
    expect(res.body.verificationRequired).toBe(true);
  });
});
