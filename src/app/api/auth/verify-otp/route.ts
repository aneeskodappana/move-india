import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, parseJson } from "@/lib/http";
import { issueSessionToken } from "@/lib/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
} from "@/lib/session-cookie";
import { verifyOtpInputSchema } from "@/schemas/auth.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, verifyOtpInputSchema);
    const services = createApplicationServices();
    const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const identity = await services.auth.verifyOtp(input, forwardedAddress || "local-demo");
    const token = issueSessionToken(identity, services.authConfig.sessionSecret, {
      ttlSeconds: SESSION_TTL_SECONDS,
    });
    const response = NextResponse.json({ ok: true, next: identity.state === "registered" ? "/home" : "/join-property" });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
