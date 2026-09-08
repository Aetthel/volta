import { jest } from "@jest/globals";
import { updateHours, updateHolidays } from "../../controllers/businessController.js";
import { deleteBusiness } from "../../services/adminService.js";
import * as businessService from "../../services/businessService.js";
import { cacheService } from "../../services/cacheService.js";
import prisma from "../../config/db.js";

const CLAVE = "volta:cache:biz:biz-1:schedule";

const respuesta = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
};

const req = (body) => ({
  params: { id: "biz-1" },
  body,
  user: { role: "JEFE", businessId: "biz-1" },
});

describe("invalidación de la caché del portal público", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("editar el horario invalida la entrada cacheada", async () => {
    jest.spyOn(businessService, "getBusinessById").mockResolvedValue({ id: "biz-1" });
    jest.spyOn(businessService, "updateBusinessHours").mockResolvedValue(undefined);
    jest.spyOn(businessService, "getBusinessHours").mockResolvedValue([]);
    const del = jest.spyOn(cacheService, "del").mockResolvedValue(true);

    const siete = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      openTime: "09:00",
      closeTime: "20:00",
      isClosed: false,
    }));
    await updateHours(req(siete), respuesta());

    expect(del).toHaveBeenCalledWith(CLAVE);
  });

  it("editar los festivos invalida la entrada cacheada", async () => {
    jest.spyOn(businessService, "getBusinessById").mockResolvedValue({ id: "biz-1" });
    jest.spyOn(businessService, "updateBusinessHolidays").mockResolvedValue(undefined);
    jest.spyOn(businessService, "getBusinessHolidays").mockResolvedValue([]);
    const del = jest.spyOn(cacheService, "del").mockResolvedValue(true);

    await updateHolidays(req([{ holidayKey: "ANO_NUEVO", isObserved: true }]), respuesta());

    expect(del).toHaveBeenCalledWith(CLAVE);
  });

  it("borrar un negocio limpia todas sus claves, aunque no pase por sus endpoints", async () => {
    // La cascada tiene su propia cobertura; aquí sólo interesa que se invalide.
    jest.spyOn(prisma, "$transaction").mockResolvedValue(undefined);
    const invalidar = jest.spyOn(cacheService, "invalidatePattern").mockResolvedValue(3);

    await deleteBusiness("biz-1");

    expect(invalidar).toHaveBeenCalledWith("volta:cache:biz:biz-1:*");
  });
});
