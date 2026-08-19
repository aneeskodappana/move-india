import type { NextRequest } from "next/server";
import { AppError } from "@/lib/app-error";
import { errorResponse } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { historyQuerySchema } from "@/schemas/history.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const month = new URL(request.url).searchParams.get("month") ?? undefined;
    const parsed = historyQuerySchema.safeParse({ month });
    if (!parsed.success) {
      throw new AppError("invalid_request", "Check the submitted fields and try again.", 400);
    }
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    return Response.json({
      history: await services.history.getProofPack(session, parsed.data.month),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
