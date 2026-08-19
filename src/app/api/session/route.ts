import type { NextRequest } from "next/server";
import { errorResponse } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  try {
    const services = createApplicationServices();
    return Response.json({ session: requireRequestSession(request, services.authConfig.sessionSecret) });
  } catch (error) {
    return errorResponse(error);
  }
}
