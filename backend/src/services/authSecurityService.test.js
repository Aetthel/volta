import {
  generateOtpCode,
  generateBackupCodes,
  hashPassword,
  comparePassword,
  verifyTotp,
} from "./authSecurityService.js";

describe("AuthSecurityService", () => {
  it("generates valid OTP codes", () => {
    const otp1 = generateOtpCode();
    const otp2 = generateOtpCode();
    expect(otp1).toHaveLength(6);
    expect(/^\d{6}$/.test(otp1)).toBe(true);
    expect(otp1).not.toBe(otp2);
  });

  it("hashes and compares passwords correctly", async () => {
    const rawPassword = "SecurePassword123!";
    const hash = await hashPassword(rawPassword);
    expect(typeof hash).toBe("string");
    expect(await comparePassword(rawPassword, hash)).toBe(true);
    expect(await comparePassword("WrongPassword", hash)).toBe(false);
  });

  it("generates 8 valid backup codes", () => {
    const backupCodes = generateBackupCodes();
    expect(backupCodes).toHaveLength(8);
    expect(backupCodes[0]).toHaveLength(9);
  });

  it("verifies TOTP codes properly", () => {
    const testSecret = "JBSWY3DPEHPK3PXP";
    expect(verifyTotp(testSecret, "000000")).toBe(false);
    expect(verifyTotp(testSecret, "invalid")).toBe(false);
    expect(verifyTotp(null, "123456")).toBe(false);
  });
});
