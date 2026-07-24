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
