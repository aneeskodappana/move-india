import type { NextRequest } from "next/server";
import { errorResponse, parseOptionalJson } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { payCurrentMonthInputSchema } from "@/schemas/payment.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await parseOptionalJson(request, payCurrentMonthInputSchema);
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    const payment = await services.payments.payCurrentMonth(session);
    return Response.json({ ok: true, payment });
  } catch (error) {
    return errorResponse(error);
  }
}
