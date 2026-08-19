import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, parseJson } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { issueSessionToken } from "@/lib/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
} from "@/lib/session-cookie";
import { joinPropertyInputSchema } from "@/schemas/registration.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, joinPropertyInputSchema);
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    const occupant = await services.occupants.register(session, input);
    const token = issueSessionToken(
      {
        state: "registered",
        phone: occupant.phone,
        name: occupant.name,
        occupantId: occupant.id,
        propertyId: occupant.propertyId,
      },
      services.authConfig.sessionSecret,
      { ttlSeconds: SESSION_TTL_SECONDS },
    );
    const response = NextResponse.json({ ok: true, occupant, next: "/home" }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
