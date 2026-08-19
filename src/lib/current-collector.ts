import { cookies } from "next/headers";
import { getAuthConfig } from "@/lib/auth-config";
import {
  COLLECTOR_COOKIE_NAME,
  verifyCollectorSessionToken,
} from "@/lib/collector-session";

export async function getCurrentCollector() {
  const token = (await cookies()).get(COLLECTOR_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCollectorSessionToken(token, getAuthConfig().sessionSecret);
}
