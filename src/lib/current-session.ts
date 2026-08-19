import { cookies } from "next/headers";
import { getAuthConfig } from "@/lib/auth-config";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { verifySessionToken } from "@/lib/session";

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, getAuthConfig().sessionSecret);
}
