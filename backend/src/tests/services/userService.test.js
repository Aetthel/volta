import { jest } from "@jest/globals";
import * as userService from "../../services/userService.js";
import prisma from "../../config/db.js";

describe("userService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("hashPassword", () => {
    it("should return a hashed password string", async () => {
      const hash = await userService.hashPassword("secret123");
      expect(hash).toBeDefined();
      expect(hash).not.toBe("secret123");
      expect(typeof hash).toBe("string");
    });
  });

  describe("getUsers", () => {
    it("nunca expone secretos de la cuenta al listar el equipo", async () => {
      // Este listado lo puede pedir cualquier miembro del salón, incluido un
      // EMPLEADO. Llegó a devolver la fila entera menos `password`, y con ella
      // el `twoFactorSecret` en claro: cualquier compañero podía generar los
      // códigos de doble factor de su jefe.
      const findManySpy = jest.spyOn(prisma.user, "findMany").mockResolvedValue([]);

      await userService.getUsers({ businessId: "b-1" });

      const select = findManySpy.mock.calls[0][0].select;
      expect(select).toBeDefined();

      for (const secret of [
        "password",
        "twoFactorSecret",
        "twoFactorBackupCodes",
        "otpCode",
        "otpExpiresAt",
        "resetPasswordToken",
        "resetPasswordExpiresAt",
        "verificationLoginToken",
        "verificationLoginExpiresAt",
      ]) {
        expect(select[secret]).toBeUndefined();
      }
    });

    it("sigue devolviendo lo que necesitan las pantallas de equipo y perfil", async () => {
      const findManySpy = jest.spyOn(prisma.user, "findMany").mockResolvedValue([]);

      await userService.getUsers({});

      const select = findManySpy.mock.calls[0][0].select;
      // `twoFactorEnabled` es el que pinta el interruptor de ProfileSection:
      // saber si el 2FA está activo no revela nada que permita suplantarlo.
      for (const field of ["id", "name", "email", "role", "twoFactorEnabled", "createdAt"]) {
        expect(select[field]).toBe(true);
      }
      expect(select.business).toEqual({ select: { name: true } });
    });
  });

  describe("getUserByEmail", () => {
    it("should return null if email is empty", async () => {
      const result = await userService.getUserByEmail("");
      expect(result).toBeNull();
    });

    it("should query prisma with insensitive mode and trimmed email", async () => {
      const mockUser = { id: "u1", email: "test@volta.es", name: "Test User" };
      jest.spyOn(prisma.user, "findFirst").mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail("  TEST@VOLTA.ES  ");
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: "test@volta.es",
            mode: "insensitive",
          },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("createUser", () => {
    it("should hash password and create user in database", async () => {
      const mockCreated = { id: "u2", email: "new@volta.es", name: "New" };
      jest.spyOn(prisma.user, "create").mockResolvedValue(mockCreated);

      const result = await userService.createUser({
        name: "New",
        email: "new@volta.es",
        password: "plainPassword123",
        role: "JEFE",
      });

      expect(prisma.user.create).toHaveBeenCalled();
      const callData = prisma.user.create.mock.calls[0][0].data;
      expect(callData.password).not.toBe("plainPassword123");
      expect(result).toEqual(mockCreated);
    });
  });
});
