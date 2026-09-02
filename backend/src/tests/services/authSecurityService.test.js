import { jest } from "@jest/globals";
import crypto from "node:crypto";
import prisma from "../../config/db.js";
import {
  verifyUserOtp,
  consumeVerificationLoginToken,
} from "../../services/authSecurityService.js";

const sha256 = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

/** Usuario recién registrado, con un código válido pendiente de introducir. */
function pendingUser(overrides = {}) {
  return {
    id: "u-1",
    name: "Laura García",
    email: "laura@volta.es",
    role: "JEFE",
    businessId: "b-1",
    status: "PENDING_VERIFICATION",
    emailVerified: false,
    twoFactorEnabled: false,
    otpCode: "123456",
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    otpAttempts: 0,
    business: { id: "b-1", name: "Salón Volta" },
    ...overrides,
  };
}

describe("verifyUserOtp", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("activa la cuenta y emite un token de un solo uso con el código correcto", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(pendingUser());
    const updateSpy = jest
      .spyOn(prisma.user, "update")
      .mockResolvedValue(pendingUser({ status: "ACTIVE", emailVerified: true }));

    const result = await verifyUserOtp("laura@volta.es", "123456");

    expect(result.success).toBe(true);
    expect(result.user.status).toBe("ACTIVE");
    expect(typeof result.loginToken).toBe("string");
    expect(result.loginToken.length).toBeGreaterThan(32);

    // La primera escritura es la que activa la cuenta.
    expect(updateSpy.mock.calls[0][0].data).toMatchObject({
      status: "ACTIVE",
      emailVerified: true,
      otpCode: null,
      otpAttempts: 0,
    });

    // La segunda guarda el token, y lo guarda hasheado: el original sólo viaja
    // en la respuesta y nunca queda en la base.
    const storedToken = updateSpy.mock.calls[1][0].data.verificationLoginToken;
    expect(storedToken).toBe(sha256(result.loginToken));
    expect(storedToken).not.toBe(result.loginToken);
  });

  it("no devuelve datos ni token cuando la cuenta ya estaba verificada", async () => {
    // Esta rama responde sin llegar a comprobar el código, así que filtrar el
    // usuario delataría cuentas ajenas y emitir el token permitiría suplantarlas
    // con sólo conocer el correo.
    jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(pendingUser({ emailVerified: true, status: "ACTIVE" }));
    const updateSpy = jest.spyOn(prisma.user, "update");

    const result = await verifyUserOtp("laura@volta.es", "000000");

    expect(result).toEqual({ success: true, alreadyVerified: true });
    expect(result.user).toBeUndefined();
    expect(result.loginToken).toBeUndefined();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("cuenta el intento fallido y rechaza un código incorrecto", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(pendingUser());
    const updateSpy = jest.spyOn(prisma.user, "update").mockResolvedValue({});

    await expect(verifyUserOtp("laura@volta.es", "999999")).rejects.toThrow("incorrecto");

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ data: { otpAttempts: { increment: 1 } } })
    );
  });

  it("rechaza un código caducado", async () => {
    jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(pendingUser({ otpExpiresAt: new Date(Date.now() - 1000) }));

    await expect(verifyUserOtp("laura@volta.es", "123456")).rejects.toThrow("expirado");
  });

  it("rechaza cuando se ha agotado el número de intentos", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(pendingUser({ otpAttempts: 5 }));

    await expect(verifyUserOtp("laura@volta.es", "123456")).rejects.toThrow("máximo de intentos");
  });

  it("no reactiva una cuenta suspendida", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(pendingUser({ status: "SUSPENDED" }));
    const updateSpy = jest
      .spyOn(prisma.user, "update")
      .mockResolvedValue(pendingUser({ status: "SUSPENDED", emailVerified: true }));

    const result = await verifyUserOtp("laura@volta.es", "123456");

    expect(updateSpy.mock.calls[0][0].data.status).toBe("SUSPENDED");
    expect(result.loginToken).toBeNull();
  });
});

describe("consumeVerificationLoginToken", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("busca por el hash del token, nunca por el token en claro", async () => {
    const raw = "a".repeat(64);
    const updateManySpy = jest.spyOn(prisma.user, "updateMany").mockResolvedValue({ count: 1 });
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(pendingUser({ status: "ACTIVE" }));

    const user = await consumeVerificationLoginToken("Laura@Volta.es", raw);

    expect(user.id).toBe("u-1");

    const where = updateManySpy.mock.calls[0][0].where;
    expect(where.verificationLoginToken).toBe(sha256(raw));
    expect(where.email).toBe("laura@volta.es");
    expect(where.status).toBe("ACTIVE");
    // Esta vía no pide contraseña; una cuenta con 2FA debe pasar por el acceso normal.
    expect(where.twoFactorEnabled).toBe(false);
  });

  it("gasta el token en la propia consulta condicional", async () => {
    jest.spyOn(prisma.user, "updateMany").mockResolvedValue({ count: 1 });
    const findSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(pendingUser({ status: "ACTIVE" }));

    await consumeVerificationLoginToken("laura@volta.es", "b".repeat(64));

    expect(findSpy).toHaveBeenCalled();
  });

  it("devuelve null si el token estaba gastado, caducado o no existía", async () => {
    // El `count: 0` cubre los tres casos a la vez: la condición del updateMany
    // exige token vigente, cuenta activa y sin 2FA.
    jest.spyOn(prisma.user, "updateMany").mockResolvedValue({ count: 0 });
    const findSpy = jest.spyOn(prisma.user, "findUnique");

    const user = await consumeVerificationLoginToken("laura@volta.es", "c".repeat(64));

    expect(user).toBeNull();
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("devuelve null sin tocar la base si falta el correo o el token", async () => {
    const updateManySpy = jest.spyOn(prisma.user, "updateMany");

    expect(await consumeVerificationLoginToken("laura@volta.es", "")).toBeNull();
    expect(await consumeVerificationLoginToken("", "token")).toBeNull();
    expect(updateManySpy).not.toHaveBeenCalled();
  });
});
