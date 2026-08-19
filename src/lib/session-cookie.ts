export const SESSION_COOKIE_NAME = "vandi_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  priority: "high" as const,
};
