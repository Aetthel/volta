import { jest } from "@jest/globals";
import prisma from "../../config/db.js";
import whatsappManager from "../../services/whatsappService.js";
import {
  startVerification,
  verifyCode,
  issueBookingToken,
  verifyBookingToken,
  purgeExpiredVerifications,
  MAX_ATTEMPTS,
  MAX_CODES_PER_WINDOW,
} from "../../services/bookingIdentityService.js";

const BUSINESS = "biz-1";
const PHONE_INPUT = "+34 600 11 22 33";
const PHONE_CANONICAL = "600112233";

/** Captura el código real leyéndolo del mensaje enviado por WhatsApp. */
const captureSentCode = (sendSpy) => {
  const [, , message] = sendSpy.mock.calls.at(-1);
  return message.match(/\b(\d{6})\b/)[1];
};

const mockVerificationStore = () => {
  const rows = [];

  jest.spyOn(prisma.bookingVerification, "create").mockImplementation(async ({ data }) => {
    const row = { id: `v${rows.length + 1}`, attempts: 0, consumedAt: null, ...data };
    rows.push(row);
    return row;
  });

  jest.spyOn(prisma.bookingVerification, "findFirst").mockImplementation(async ({ where }) => {
    const matches = rows.filter(
      (r) =>
        r.businessId === where.businessId &&
        r.phone === where.phone &&
        (where.consumedAt !== null || r.consumedAt === null)
    );
    return matches.at(-1) || null;
  });

  jest.spyOn(prisma.bookingVerification, "update").mockImplementation(async ({ where, data }) => {
    const row = rows.find((r) => r.id === where.id);
    if (data.attempts?.increment) row.attempts += data.attempts.increment;
    if (data.consumedAt !== undefined) row.consumedAt = data.consumedAt;
    return row;
  });

  jest.spyOn(prisma.bookingVerification, "updateMany").mockImplementation(async () => ({ count: 0 }));

  return rows;
};

describe("bookingIdentityService", () => {
  let sendSpy;

  beforeEach(() => {
    jest.spyOn(whatsappManager, "isReady").mockReturnValue(true);
    sendSpy = jest.spyOn(whatsappManager, "sendMessage").mockResolvedValue({ id: "msg" });
    jest.spyOn(prisma.bookingVerification, "count").mockResolvedValue(0);
    jest.spyOn(prisma.user, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.alert, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.alert, "create").mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("startVerification", () => {
    it("asks for a full name when the phone is not a client yet, without sending anything", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue(null);

      const result = await startVerification({ businessId: BUSINESS, phone: PHONE_INPUT });

      expect(result).toEqual({ state: "NAME_REQUIRED", isRegistered: false });
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it("sends the code straight away for a known client and never leaks it in the result", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "García" });
      mockVerificationStore();

      const result = await startVerification({ businessId: BUSINESS, phone: PHONE_INPUT });

      expect(result.state).toBe("OTP_SENT");
      expect(result.isRegistered).toBe(true);
      expect(result.maskedPhone).toBe("••••••233");
      expect(JSON.stringify(result)).not.toContain(captureSentCode(sendSpy));
      expect(sendSpy).toHaveBeenCalledWith(BUSINESS, PHONE_CANONICAL, expect.stringMatching(/\d{6}/));
    });

    it("sends the code for an unknown phone once the name is supplied", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue(null);
      const rows = mockVerificationStore();

      const result = await startVerification({
        businessId: BUSINESS,
        phone: PHONE_INPUT,
        fullName: "Luis Pérez",
      });

      expect(result.state).toBe("OTP_SENT");
      expect(result.isRegistered).toBe(false);
      expect(rows.at(-1).pendingName).toBe("Luis Pérez");
    });

    it("stores the code hashed, never in the clear", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "" });
      const rows = mockVerificationStore();

      await startVerification({ businessId: BUSINESS, phone: PHONE_INPUT });

      expect(rows.at(-1).codeHash).not.toContain(captureSentCode(sendSpy));
      expect(rows.at(-1).codeHash.length).toBeGreaterThan(20);
    });

    it("refuses a fourth code within the window", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "" });
      jest.spyOn(prisma.bookingVerification, "count").mockResolvedValue(MAX_CODES_PER_WINDOW);

      await expect(startVerification({ businessId: BUSINESS, phone: PHONE_INPUT })).rejects.toMatchObject({
        statusCode: 429,
      });
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it("returns 503 and alerts the business owners when the gateway is down", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "" });
      jest.spyOn(whatsappManager, "isReady").mockReturnValue(false);
      jest.spyOn(prisma.user, "findMany").mockResolvedValue([{ id: "u1" }]);
      const alertSpy = jest.spyOn(prisma.alert, "create").mockResolvedValue({});

      await expect(startVerification({ businessId: BUSINESS, phone: PHONE_INPUT })).rejects.toMatchObject({
        statusCode: 503,
      });
      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: "u1" }) })
      );
    });

    it("does not persist a code the visitor never received", async () => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue({ id: "c1", name: "Ana", surname: "" });
      const rows = mockVerificationStore();
      sendSpy.mockRejectedValue(new Error("chat not found"));

      await expect(startVerification({ businessId: BUSINESS, phone: PHONE_INPUT })).rejects.toMatchObject({
        statusCode: 503,
      });
      expect(rows).toHaveLength(0);
    });

    it("rejects an unusable phone number before touching the gateway", async () => {
      await expect(
        startVerification({ businessId: BUSINESS, phone: "123" })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe("verifyCode", () => {
    const startAndCapture = async ({ client = { id: "c1", name: "Ana", surname: "García" } } = {}) => {
      jest.spyOn(prisma.client, "findFirst").mockResolvedValue(client);
      const rows = mockVerificationStore();
      await startVerification({ businessId: BUSINESS, phone: PHONE_INPUT, fullName: "Luis Pérez" });
      return { rows, code: captureSentCode(sendSpy) };
    };

    it("issues a booking session for the right code", async () => {
      const { code } = await startAndCapture();

      const result = await verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code });

      expect(result.bookingToken).toBeTruthy();
      expect(result.displayName).toBe("Ana García");
      expect(verifyBookingToken(result.bookingToken, BUSINESS)).toEqual({
        businessId: BUSINESS,
        phone: PHONE_CANONICAL,
        name: "Ana García",
      });
    });

    it("uses the name given at identification when the client does not exist yet", async () => {
      const { code } = await startAndCapture({ client: null });

      const result = await verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code });

      expect(result.isRegistered).toBe(false);
      expect(result.displayName).toBe("Luis Pérez");
    });

    it("rejects a code that has already been used", async () => {
      const { code } = await startAndCapture();
      await verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code });

      await expect(verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("rejects an expired code", async () => {
      const { rows, code } = await startAndCapture();
      rows.at(-1).expiresAt = new Date(Date.now() - 1000);

      await expect(verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code })).rejects.toMatchObject({
        statusCode: 400,
        expired: true,
      });
    });

    it("counts down the attempts and kills the code on the last one", async () => {
      const { rows } = await startAndCapture();

      for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt += 1) {
        await expect(
          verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code: "000000" })
        ).rejects.toMatchObject({ attemptsLeft: MAX_ATTEMPTS - attempt });
      }

      await expect(
        verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code: "000000" })
      ).rejects.toMatchObject({ attemptsLeft: 0 });

      expect(rows.at(-1).consumedAt).not.toBeNull();
    });

    it("rejects a code that was never requested", async () => {
      jest.spyOn(prisma.bookingVerification, "findFirst").mockResolvedValue(null);

      await expect(
        verifyCode({ businessId: BUSINESS, phone: PHONE_INPUT, code: "123456" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("booking token", () => {
    it("is refused for a different business", () => {
      const { token } = issueBookingToken({ businessId: BUSINESS, phone: PHONE_CANONICAL, name: "Ana" });

      expect(verifyBookingToken(token, "otro-negocio")).toBeNull();
      expect(verifyBookingToken(token, BUSINESS)).not.toBeNull();
    });

    it("is refused once expired", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-08-28T10:00:00Z"));
      const { token } = issueBookingToken({ businessId: BUSINESS, phone: PHONE_CANONICAL });

      jest.setSystemTime(new Date("2026-08-28T10:31:00Z"));
      expect(verifyBookingToken(token, BUSINESS)).toBeNull();

      jest.useRealTimers();
    });

    it("is refused when tampered with", () => {
      const { token } = issueBookingToken({ businessId: BUSINESS, phone: PHONE_CANONICAL });
      const [header, body, signature] = token.split(".");
      const forgedBody = Buffer.from(
        JSON.stringify({ scope: "public-booking", businessId: BUSINESS, phone: "600999999", exp: 9999999999 })
      ).toString("base64url");

      expect(verifyBookingToken(`${header}.${forgedBody}.${signature}`, BUSINESS)).toBeNull();
    });

    it("is refused when it is not a public-booking token", () => {
      const dashboardShaped = issueBookingToken({ businessId: BUSINESS, phone: PHONE_CANONICAL }).token;
      const [header, , signature] = dashboardShaped.split(".");
      const otherScope = Buffer.from(
        JSON.stringify({ scope: "dashboard", businessId: BUSINESS, phone: PHONE_CANONICAL })
      ).toString("base64url");

      expect(verifyBookingToken(`${header}.${otherScope}.${signature}`, BUSINESS)).toBeNull();
    });
  });

  describe("purgeExpiredVerifications", () => {
    it("deletes everything older than the retention window", async () => {
      const deleteSpy = jest
        .spyOn(prisma.bookingVerification, "deleteMany")
        .mockResolvedValue({ count: 4 });

      await expect(purgeExpiredVerifications()).resolves.toBe(4);

      const { where } = deleteSpy.mock.calls[0][0];
      const cutoff = where.createdAt.lt.getTime();
      expect(Date.now() - cutoff).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 5000);
    });
  });
});
