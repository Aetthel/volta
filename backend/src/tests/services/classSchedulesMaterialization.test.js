import { jest } from "@jest/globals";
import { ensureSchedulesMaterialized } from "../../services/classSchedulesService.js";
import prisma from "../../config/db.js";

describe("ensureSchedulesMaterialized", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("comparte la materialización ya en curso entre llamadas concurrentes", async () => {
    // Varias pestañas abriendo la agenda a la vez repetían la tanda entera.
    let resolver;
    const spy = jest
      .spyOn(prisma.classSchedule, "findMany")
      .mockImplementation(() => new Promise((r) => (resolver = r)));

    const a = ensureSchedulesMaterialized("biz-1");
    const b = ensureSchedulesMaterialized("biz-1");
    resolver([]); // ningún horario pendiente

    expect(await a).toBe(0);
    expect(await b).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("negocios distintos no comparten la misma tanda", async () => {
    const spy = jest.spyOn(prisma.classSchedule, "findMany").mockResolvedValue([]);

    await Promise.all([
      ensureSchedulesMaterialized("biz-1"),
      ensureSchedulesMaterialized("biz-2"),
    ]);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("libera el negocio al terminar, para que la siguiente carga vuelva a extender", async () => {
    const spy = jest.spyOn(prisma.classSchedule, "findMany").mockResolvedValue([]);

    await ensureSchedulesMaterialized("biz-1");
    await ensureSchedulesMaterialized("biz-1");

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("libera el negocio aunque la materialización falle", async () => {
    jest
      .spyOn(prisma.classSchedule, "findMany")
      .mockRejectedValueOnce(new Error("db caída"))
      .mockResolvedValueOnce([]);

    await expect(ensureSchedulesMaterialized("biz-1")).rejects.toThrow("db caída");
    await expect(ensureSchedulesMaterialized("biz-1")).resolves.toBe(0);
  });
});
