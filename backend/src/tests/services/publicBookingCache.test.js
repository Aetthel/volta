import { jest } from "@jest/globals";
import { getAvailableSlots } from "../../controllers/publicBookingController.js";
import { cacheService } from "../../services/cacheService.js";
import prisma from "../../config/db.js";

const HORARIO = [
  { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
];

const respuesta = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
};

const peticion = () => ({
  params: { businessId: "biz-1" },
  query: { date: "2026-09-14" }, // lunes
});

describe("caché de horario y festivos en disponibilidad pública", () => {
  beforeEach(() => {
    jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
      enablePublicBooking: true,
      subscriptionStatus: "ACTIVE",
    });
    jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("con caché disponible no consulta horario ni festivos a Postgres", async () => {
    jest.spyOn(cacheService, "get").mockResolvedValue({
      businessHours: HORARIO,
      holidayPreferences: [],
    });
    const horas = jest.spyOn(prisma.businessHours, "findMany");
    const festivos = jest.spyOn(prisma.businessHoliday, "findMany");

    await getAvailableSlots(peticion(), respuesta());

    expect(horas).not.toHaveBeenCalled();
    expect(festivos).not.toHaveBeenCalled();
  });

  it("sin caché consulta Postgres y guarda el resultado", async () => {
    jest.spyOn(cacheService, "get").mockResolvedValue(null);
    const set = jest.spyOn(cacheService, "set").mockResolvedValue(true);
    jest.spyOn(prisma.businessHours, "findMany").mockResolvedValue(HORARIO);
    jest.spyOn(prisma.businessHoliday, "findMany").mockResolvedValue([]);

    await getAvailableSlots(peticion(), respuesta());

    expect(set).toHaveBeenCalledWith(
      "volta:cache:biz:biz-1:schedule",
      { businessHours: HORARIO, holidayPreferences: [] },
      300
    );
  });

  it("las citas del día NUNCA salen de caché: la disponibilidad se recalcula siempre", async () => {
    jest.spyOn(cacheService, "get").mockResolvedValue({
      businessHours: HORARIO,
      holidayPreferences: [],
    });
    const citas = jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);

    await getAvailableSlots(peticion(), respuesta());
    await getAvailableSlots(peticion(), respuesta());

    expect(citas).toHaveBeenCalledTimes(2);
  });

  it("si Redis falla se sigue sirviendo desde Postgres", async () => {
    // cacheService ya devuelve null ante error; se simula ese contrato.
    jest.spyOn(cacheService, "get").mockResolvedValue(null);
    jest.spyOn(cacheService, "set").mockResolvedValue(false);
    jest.spyOn(prisma.businessHours, "findMany").mockResolvedValue(HORARIO);
    jest.spyOn(prisma.businessHoliday, "findMany").mockResolvedValue([]);

    const res = respuesta();
    await getAvailableSlots(peticion(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("availableSlots");
  });
});
