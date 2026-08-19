import { NextResponse, type NextRequest } from "next/server";
import {
  COLLECTOR_COOKIE_NAME,
  COLLECTOR_SESSION_TTL_SECONDS,
  issueCollectorSessionToken,
} from "@/lib/collector-session";
import { errorResponse, parseJson } from "@/lib/http";
import { sessionCookieOptions } from "@/lib/session-cookie";
import { collectorLoginInputSchema } from "@/schemas/coordinator.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, collectorLoginInputSchema);
    const services = createApplicationServices();
    services.collectorAuth.verifyCode(input);
    const token = issueCollectorSessionToken(services.authConfig.sessionSecret, {
      ttlSeconds: COLLECTOR_SESSION_TTL_SECONDS,
    });
    const response = NextResponse.json({ ok: true, next: "/coordinator" });
    response.cookies.set(COLLECTOR_COOKIE_NAME, token, {
      ...sessionCookieOptions,
      maxAge: COLLECTOR_SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
