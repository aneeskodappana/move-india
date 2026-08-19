import type { NextRequest } from "next/server";
import { errorResponse, parseJson } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { markKeptOutInputSchema } from "@/schemas/handover.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, markKeptOutInputSchema);
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    const handover = await services.handovers.markKeptOut(session, input);
    return Response.json({ ok: true, handover });
  } catch (error) {
    return errorResponse(error);
  }
}
