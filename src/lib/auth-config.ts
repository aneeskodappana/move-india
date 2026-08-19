export function getAuthConfig() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }

  return {
    devOtpCode: process.env.DEV_OTP_CODE ?? "123456",
    sessionSecret,
  };
}
