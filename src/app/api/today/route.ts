import type { NextRequest } from "next/server";
import { errorResponse } from "@/lib/http";
import { indiaIsoDate } from "@/lib/india-date";
import { requireRequestSession } from "@/lib/request-session";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    return Response.json({ today: await services.today.getForResident(session, indiaIsoDate()) });
  } catch (error) {
    return errorResponse(error);
  }
}
