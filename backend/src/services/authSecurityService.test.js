import assert from "node:assert";
import {
  generateOtpCode,
  generateBackupCodes,
  hashPassword,
  comparePassword,
  verifyTotp,
  setupTwoFactor,
} from "./authSecurityService.js";

async function runTests() {
  console.log("▶ Running Auth Security Service tests...");

  // 1. Test OTP Generation
  const otp1 = generateOtpCode();
  const otp2 = generateOtpCode();
  assert.strictEqual(otp1.length, 6, "OTP should be 6 digits");
  assert.strictEqual(/^\d{6}$/.test(otp1), true, "OTP should be strictly numeric");
  assert.notStrictEqual(otp1, otp2, "Consecutive OTPs should be distinct");
  console.log("✓ OTP generation passed");

  // 2. Test Password Hashing and Comparison
  const rawPassword = "SecurePassword123!";
  const hash = await hashPassword(rawPassword);
  assert.strictEqual(typeof hash, "string");
  assert.strictEqual(await comparePassword(rawPassword, hash), true, "Password should match its hash");
  assert.strictEqual(await comparePassword("WrongPassword", hash), false, "Wrong password should fail");
  console.log("✓ Password hashing & comparison passed");

  // 3. Test Backup Codes
  const backupCodes = generateBackupCodes();
  assert.strictEqual(backupCodes.length, 8, "Should generate exactly 8 backup codes");
  assert.strictEqual(backupCodes[0].length, 9, "Backup code should have format XXXX-XXXX (9 chars)");
  console.log("✓ Backup codes generation passed");

  // 4. Test TOTP verification & RFC 6238 implementation
  // Known test vector with standard base32 secret
  const testSecret = "JBSWY3DPEHPK3PXP"; // "Hello!" in Base32
  // verifyTotp with invalid code should fail
  assert.strictEqual(verifyTotp(testSecret, "000000"), false, "Random 6 digits should fail TOTP");
  assert.strictEqual(verifyTotp(testSecret, "invalid"), false, "Non-digit should fail TOTP");
  assert.strictEqual(verifyTotp(null, "123456"), false, "Null secret should fail TOTP");

  console.log("All Auth Security unit tests passed! ✅");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
