export const EXAMPLE_SESSION_SECRET = "replace-with-at-least-32-random-characters";

export function getAuthConfig(
  env: Record<string, string | undefined> = process.env,
  nodeEnv = process.env.NODE_ENV,
) {
  const sessionSecret = env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }
  if (
    sessionSecret === EXAMPLE_SESSION_SECRET &&
    (nodeEnv === "production" || env.VERCEL === "1")
  ) {
    throw new Error("SESSION_SECRET must not use the example value in a deployed environment.");
  }

  return {
    devCollectorCode: env.DEV_COLLECTOR_CODE ?? "654321",
    devOtpCode: env.DEV_OTP_CODE ?? "123456",
    sessionSecret,
  };
}
