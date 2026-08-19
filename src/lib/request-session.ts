import type { NextRequest } from "next/server";
import { AppError } from "@/lib/app-error";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { verifySessionToken } from "@/lib/session";

export function requireRequestSession(request: NextRequest, secret: string) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value, secret);
  if (!session) throw new AppError("unauthorized", "Sign in to continue.", 401);
  return session;
}
