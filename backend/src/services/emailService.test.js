import { jest } from "@jest/globals";

/**
 * El servicio decide entre simular el envío (sin clave) y enviarlo de verdad
 * por Resend. Antes ambos caminos devolvían éxito, así que un fallo real de
 * entrega era indistinguible de un envío correcto; estos tests fijan que ya no.
 */
const loadService = async ({ resendApiKey = "", emailFrom = "Volta <test@volta.dev>" } = {}) => {
  jest.resetModules();

  jest.unstable_mockModule("../config/index.js", () => ({
    default: { resendApiKey, emailFrom },
  }));

  jest.unstable_mockModule("../utils/logger.js", () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  }));

  const service = await import("./emailService.js");
  const { logger } = await import("../utils/logger.js");
  return { service, logger };
};

const RESET_URL = "http://localhost:3000/reset-password?token=abc123&email=ana%40volta.dev";

describe("EmailService — correo de recuperación de contraseña", () => {
  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  describe("sin clave de Resend", () => {
    test("simula el envío en lugar de llamar a la API", async () => {
      const { service } = await loadService({ resendApiKey: "" });
      global.fetch = jest.fn();

      const result = await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana García",
        resetUrl: RESET_URL,
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, simulated: true });
    });

    test("deja el enlace en el log para poder seguir el flujo en local", async () => {
      const { service, logger } = await loadService({ resendApiKey: "" });

      await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana",
        resetUrl: RESET_URL,
      });

      const logged = logger.info.mock.calls.map((c) => c.join(" ")).join("\n");
      expect(logged).toContain(RESET_URL);
    });
  });

  describe("con clave de Resend", () => {
    test("envía por la API con el remitente configurado", async () => {
      const { service } = await loadService({
        resendApiKey: "re_test_key",
        emailFrom: "Volta <no-reply@volta.dev>",
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "email-123" }),
      });

      const result = await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana",
        resetUrl: RESET_URL,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe("https://api.resend.com/emails");
      expect(options.headers.Authorization).toBe("Bearer re_test_key");

      const body = JSON.parse(options.body);
      expect(body.from).toBe("Volta <no-reply@volta.dev>");
      expect(body.to).toEqual(["ana@volta.dev"]);
      expect(body.subject).toMatch(/contraseña/i);
      // El enlace debe viajar tanto en la versión HTML como en la de texto.
      expect(body.html).toContain(RESET_URL);
      expect(body.text).toContain(RESET_URL);

      expect(result).toEqual({ success: true, id: "email-123" });
    });

    test("avisa de que el enlace caduca y es de un solo uso", async () => {
      const { service } = await loadService({ resendApiKey: "re_test_key" });
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "x" }) });

      await service.sendPasswordResetEmail("ana@volta.dev", { name: "Ana", resetUrl: RESET_URL });

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.html).toMatch(/1 hora/);
      expect(body.html).toMatch(/un solo uso/i);
    });

    test("no da por enviado un correo que Resend rechaza", async () => {
      const { service, logger } = await loadService({ resendApiKey: "re_test_key" });
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => '{"message":"domain is not verified"}',
      });

      const result = await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana",
        resetUrl: RESET_URL,
      });

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
      // El motivo real de Resend debe quedar registrado para poder depurarlo.
      const logged = logger.error.mock.calls.map((c) => c.join(" ")).join("\n");
      expect(logged).toContain("domain is not verified");
    });

    test("no da por enviado un correo si la red falla", async () => {
      const { service, logger } = await loadService({ resendApiKey: "re_test_key" });
      global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

      const result = await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana",
        resetUrl: RESET_URL,
      });

      expect(result).toEqual({ success: false, error: "network down" });
      expect(logger.error).toHaveBeenCalled();
    });

    test("no se queda colgado si Resend no responde", async () => {
      const { service } = await loadService({ resendApiKey: "re_test_key" });
      global.fetch = jest.fn((_url, options) => {
        expect(options.signal).toBeDefined();
        return Promise.reject(new Error("The operation was aborted due to timeout"));
      });

      const result = await service.sendPasswordResetEmail("ana@volta.dev", {
        name: "Ana",
        resetUrl: RESET_URL,
      });

      expect(result.success).toBe(false);
    });
  });
});
