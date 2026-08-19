import type { NextRequest } from "next/server";
import { errorResponse, parseJson } from "@/lib/http";
import { requireRequestCollector } from "@/lib/request-collector";
import { confirmCollectedInputSchema } from "@/schemas/handover.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, confirmCollectedInputSchema);
    const services = createApplicationServices();
    const collector = requireRequestCollector(request, services.authConfig.sessionSecret);
    const handover = await services.handovers.confirmCollected(collector, input);
    return Response.json({ ok: true, handover });
  } catch (error) {
    return errorResponse(error);
  }
}
