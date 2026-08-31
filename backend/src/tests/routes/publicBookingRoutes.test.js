import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../index.js";
import prisma from "../../config/db.js";
import whatsappManager from "../../services/whatsappService.js";
import { issueBookingToken } from "../../services/bookingIdentityService.js";

const BUSINESS_ID = "biz-1";
const OTHER_BUSINESS_ID = "biz-2";
const PHONE = "600112233";

const openBusiness = {
  id: BUSINESS_ID,
  name: "Peluquería Volta",
  address: "Calle Mayor 1",
  description: null,
  logoUrl: null,
  coverUrl: null,
  themeColor: "CLINICAL_ELEGANCE",
  enablePublicBooking: true,
  subscriptionStatus: "ACTIVE",
  hours: [],
  services: [],
};

const tokenFor = (businessId = BUSINESS_ID, name = "Ana García") =>
  issueBookingToken({ businessId, phone: PHONE, name }).token;

const futureDate = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:00:00`;
};

describe("public booking portal", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("identity gate", () => {
    it("exposes only branding on the ungated profile endpoint", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        ...openBusiness,
        hours: undefined,
        services: undefined,
      });

      const res = await request(app).get(`/api/public/booking/${BUSINESS_ID}/profile`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Peluquería Volta");
      expect(res.body.services).toBeUndefined();
      expect(res.body.hours).toBeUndefined();
      expect(res.body.phone).toBeUndefined();
      expect(res.body.email).toBeUndefined();
    });

    it("asks for the full name when the phone is not a client of the business", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(openBusiness);
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue(null);
      const sendSpy = jest.spyOn(whatsappManager, "sendMessage").mockResolvedValue({});

      const res = await request(app)
        .post(`/api/public/booking/${BUSINESS_ID}/identity/start`)
        .send({ phone: "600 11 22 33" });

      expect(res.status).toBe(200);
      expect(res.body.state).toBe("NAME_REQUIRED");
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it("never returns the code in the response body", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(openBusiness);
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "G" });
      jest.spyOn(prisma.bookingVerification, "count").mockResolvedValue(0);
      jest.spyOn(prisma.bookingVerification, "updateMany").mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.bookingVerification, "create").mockResolvedValue({});
      jest.spyOn(whatsappManager, "isReady").mockReturnValue(true);
      const sendSpy = jest.spyOn(whatsappManager, "sendMessage").mockResolvedValue({});

      const res = await request(app)
        .post(`/api/public/booking/${BUSINESS_ID}/identity/start`)
        .send({ phone: "600112233" });

      const sentCode = sendSpy.mock.calls[0][2].match(/\b(\d{6})\b/)[1];
      expect(res.status).toBe(200);
      expect(res.body.state).toBe("OTP_SENT");
      expect(JSON.stringify(res.body)).not.toContain(sentCode);
    });

    it("rejects a badly formed phone before reaching the service", async () => {
      const res = await request(app)
        .post(`/api/public/booking/${BUSINESS_ID}/identity/start`)
        .send({ phone: "123" });

      expect(res.status).toBe(400);
    });

    it("does not start a verification for a business with bookings disabled", async () => {
      jest
        .spyOn(prisma.business, "findUnique")
        .mockResolvedValue({ ...openBusiness, enablePublicBooking: false });
      const sendSpy = jest.spyOn(whatsappManager, "sendMessage").mockResolvedValue({});

      const res = await request(app)
        .post(`/api/public/booking/${BUSINESS_ID}/identity/start`)
        .send({ phone: "600112233" });

      expect(res.status).toBe(403);
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe("gated endpoints", () => {
    it("refuses the catalogue without a booking session", async () => {
      const res = await request(app).get(`/api/public/booking/${BUSINESS_ID}`);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("BOOKING_SESSION_REQUIRED");
    });

    it("refuses the available slots without a booking session", async () => {
      const res = await request(app).get(
        `/api/public/booking/${BUSINESS_ID}/available-slots?date=2026-09-01`
      );

      expect(res.status).toBe(401);
    });

    it("refuses a reservation without a booking session", async () => {
      const createSpy = jest.spyOn(prisma, "$transaction");

      const res = await request(app)
        .post("/api/public/booking/reserve")
        .send({ businessId: BUSINESS_ID, serviceId: "s1", appointmentDate: futureDate() });

      expect(res.status).toBe(401);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("refuses a token issued for another business", async () => {
      const res = await request(app)
        .get(`/api/public/booking/${BUSINESS_ID}`)
        .set("x-booking-token", tokenFor(OTHER_BUSINESS_ID));

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("BOOKING_SESSION_INVALID");
    });

    it("refuses an expired token", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-08-28T10:00:00Z"));
      const token = tokenFor();
      jest.setSystemTime(new Date("2026-08-28T11:00:00Z"));

      const res = await request(app)
        .get(`/api/public/booking/${BUSINESS_ID}`)
        .set("x-booking-token", token);

      jest.useRealTimers();
      expect(res.status).toBe(401);
    });

    it("serves the catalogue with a valid session", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        ...openBusiness,
        email: "hola@volta.com",
        phone: "961112233",
        services: [{ id: "s1", name: "Corte", duration: 30, price: 20, capacity: 1 }],
      });

      const res = await request(app)
        .get(`/api/public/booking/${BUSINESS_ID}`)
        .set("x-booking-token", tokenFor());

      expect(res.status).toBe(200);
      expect(res.body.services).toHaveLength(1);
      expect(res.body.identity).toEqual({ phone: PHONE, name: "Ana García" });
    });
  });

  describe("POST /api/public/booking/reserve", () => {
    const validSession = () => tokenFor();

    it("returns 400 when mandatory booking fields are missing", async () => {
      const res = await request(app)
        .post("/api/public/booking/reserve")
        .set("x-booking-token", validSession())
        .send({ businessId: BUSINESS_ID });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("accepts the local wall-clock time the portal shows the client", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);

      const res = await request(app)
        .post("/api/public/booking/reserve")
        .set("x-booking-token", validSession())
        .send({ businessId: BUSINESS_ID, serviceId: "s1", appointmentDate: futureDate() });

      // Llega al controlador (404 de negocio), no lo frena el validador de fecha.
      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Negocio no encontrado");
    });

    it("returns 404 if target business is not found", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);

      const res = await request(app)
        .post("/api/public/booking/reserve")
        .set("x-booking-token", validSession())
        .send({
          businessId: BUSINESS_ID,
          serviceId: "s1",
          appointmentDate: futureDate(),
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Negocio no encontrado");
    });

    it("books with the verified identity and ignores a tampered phone in the body", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({ ...openBusiness, hours: [] });
      jest.spyOn(prisma.service, "findUnique").mockResolvedValue({
        id: "s1",
        businessId: BUSINESS_ID,
        name: "Corte",
        duration: 30,
        capacity: 1,
        isActive: true,
      });

      const created = {};
      jest.spyOn(prisma, "$transaction").mockImplementation(async (fn) =>
        fn({
          appointment: {
            findMany: async () => [],
            create: async ({ data }) => {
              Object.assign(created, data);
              return { id: "a1", ...data };
            },
          },
          client: {
            upsert: async ({ where, create }) => {
              created.upsertWhere = where;
              return { id: "c1", email: null, ...create };
            },
            update: async () => ({}),
          },
        })
      );

      const res = await request(app)
        .post("/api/public/booking/reserve")
        .set("x-booking-token", validSession())
        .send({
          businessId: BUSINESS_ID,
          serviceId: "s1",
          appointmentDate: futureDate(),
          clientPhone: "699999999",
          clientName: "Impostor",
        });

      expect(res.status).toBe(201);
      expect(created.clientPhone).toBe(PHONE);
      expect(created.clientName).toBe("Ana García");
      expect(created.status).toBe("PENDING");
      expect(created.upsertWhere).toEqual({
        businessId_phone: { businessId: BUSINESS_ID, phone: PHONE },
      });
    });

    it("returns 409 without creating anything when the slot is full", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({ ...openBusiness, hours: [] });
      jest.spyOn(prisma.service, "findUnique").mockResolvedValue({
        id: "s1",
        businessId: BUSINESS_ID,
        name: "Corte",
        duration: 30,
        capacity: 1,
        isActive: true,
      });

      const clientUpsert = jest.fn();
      const target = new Date(futureDate());
      jest.spyOn(prisma, "$transaction").mockImplementation(async (fn) =>
        fn({
          appointment: {
            findMany: async () => [
              { appointmentDate: target, service: { duration: 30 } },
            ],
            create: async () => ({}),
          },
          client: { upsert: clientUpsert, update: async () => ({}) },
        })
      );

      const res = await request(app)
        .post("/api/public/booking/reserve")
        .set("x-booking-token", validSession())
        .send({ businessId: BUSINESS_ID, serviceId: "s1", appointmentDate: futureDate() });

      expect(res.status).toBe(409);
      expect(clientUpsert).not.toHaveBeenCalled();
    });
  });
});
