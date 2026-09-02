import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import authSecurityService, { verifyTotp } from "../../services/authSecurityService.js";

/**
 * Secreto de los vectores de prueba del RFC 6238: la cadena ASCII
 * "12345678901234567890" codificada en Base32.
 */
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

/**
 * Vectores oficiales del RFC 6238 (HMAC-SHA1). El RFC los publica a 8 dígitos;
 * aquí se comprueban los 6 finales, que es la longitud que usa Volta.
 *
 * Esta tabla es lo que garantiza que el secreto que enseña el código QR sirva
 * en Google Authenticator, Microsoft Authenticator o 1Password. Sin ella, un
 * retoque en la truncación dinámica o en el Base32 rompería la vinculación con
 * todas las apps y ningún otro test se enteraría.
 */
const RFC_6238_VECTORS = [
  { time: 59, code: "287082" },
  { time: 1111111109, code: "081804" },
  { time: 1111111111, code: "050471" },
  { time: 1234567890, code: "005924" },
  { time: 2000000000, code: "279037" },
  { time: 20000000000, code: "353130" },
];

/** Congela el reloj en un instante concreto para evaluar un paso TOTP fijo. */
function atTime(seconds, fn) {
  const spy = jest.spyOn(Date, "now").mockReturnValue(seconds * 1000);
  try {
    return fn();
  } finally {
    spy.mockRestore();
  }
}

describe("verifyTotp: compatibilidad con apps de autenticación estándar", () => {
  it.each(RFC_6238_VECTORS)(
    "acepta el código $code del vector RFC 6238 en T=$time",
    ({ time, code }) => {
      expect(atTime(time, () => verifyTotp(RFC_SECRET, code))).toBe(true);
    }
  );

  it("tolera el desfase de reloj de un paso hacia atrás y hacia delante", () => {
    // El código de T=1111111111 debe seguir valiendo 30s antes y 30s después.
    expect(atTime(1111111111 - 30, () => verifyTotp(RFC_SECRET, "050471"))).toBe(true);
    expect(atTime(1111111111 + 30, () => verifyTotp(RFC_SECRET, "050471"))).toBe(true);
  });

  it("rechaza un código a dos pasos de distancia", () => {
    expect(atTime(1111111111 + 60, () => verifyTotp(RFC_SECRET, "050471"))).toBe(false);
    expect(atTime(1111111111 - 60, () => verifyTotp(RFC_SECRET, "050471"))).toBe(false);
  });

  it("rechaza entradas que no sean seis dígitos sin reventar", () => {
    // Importa que devuelva false y no lance: `timingSafeEqual` aborta si los
    // buffers no miden lo mismo, y ese throw subiría hasta el inicio de sesión.
    expect(verifyTotp(RFC_SECRET, "12345")).toBe(false);
    expect(verifyTotp(RFC_SECRET, "1234567")).toBe(false);
    expect(verifyTotp(RFC_SECRET, "abcdef")).toBe(false);
    expect(verifyTotp(RFC_SECRET, "")).toBe(false);
  });

  it("tolera los espacios con los que algunas apps agrupan el código", () => {
    expect(atTime(1111111111, () => verifyTotp(RFC_SECRET, "  050471  "))).toBe(true);
    expect(atTime(1111111111, () => verifyTotp(RFC_SECRET, "050 471"))).toBe(true);
  });

  it("rechaza cuando falta el secreto o el código", () => {
    expect(verifyTotp(null, "050471")).toBe(false);
    expect(verifyTotp(RFC_SECRET, null)).toBe(false);
  });
});

describe("validateTwoFactorChallenge", () => {
  const BACKUP_PLAIN = "17E1-32E9";
  let backupHash;

  beforeAll(async () => {
    // Los códigos de respaldo se guardan hasheados y sin guiones.
    backupHash = await bcrypt.hash(BACKUP_PLAIN.replace(/-/g, ""), 10);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function userWith2fa(overrides = {}) {
    return {
      id: "u-1",
      email: "jefe@volta.es",
      twoFactorEnabled: true,
      twoFactorSecret: RFC_SECRET,
      twoFactorBackupCodes: [backupHash],
      ...overrides,
    };
  }

  it("rechaza si el usuario no tiene 2FA activo", async () => {
    jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(userWith2fa({ twoFactorEnabled: false }));

    await expect(authSecurityService.validateTwoFactorChallenge("u-1", "050471")).resolves.toBe(
      false
    );
  });

  it("acepta un código TOTP válido", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(userWith2fa());
    jest.spyOn(Date, "now").mockReturnValue(1111111111 * 1000);

    await expect(authSecurityService.validateTwoFactorChallenge("u-1", "050471")).resolves.toBe(
      true
    );
  });

  it("acepta un código de respaldo y lo gasta", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(userWith2fa());
    const updateSpy = jest.spyOn(prisma.user, "update").mockResolvedValue({});

    await expect(
      authSecurityService.validateTwoFactorChallenge("u-1", BACKUP_PLAIN)
    ).resolves.toBe(true);

    // Gastado: la lista queda sin él, así que no sirve una segunda vez.
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ data: { twoFactorBackupCodes: [] } })
    );
  });

  it("acepta un código de respaldo en minúsculas y sin guion", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(userWith2fa());
    jest.spyOn(prisma.user, "update").mockResolvedValue({});

    await expect(authSecurityService.validateTwoFactorChallenge("u-1", "17e132e9")).resolves.toBe(
      true
    );
  });

  it("rechaza un código de respaldo que ya se había consumido", async () => {
    jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(userWith2fa({ twoFactorBackupCodes: [] }));
    const updateSpy = jest.spyOn(prisma.user, "update").mockResolvedValue({});

    await expect(
      authSecurityService.validateTwoFactorChallenge("u-1", BACKUP_PLAIN)
    ).resolves.toBe(false);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
