import type { NextRequest } from "next/server";
import { AppError } from "@/lib/app-error";
import { errorResponse } from "@/lib/http";
import { requireRequestSession } from "@/lib/request-session";
import { receiptLookupSchema } from "@/schemas/payment.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ receiptId: string }> },
) {
  try {
    const { receiptId } = await context.params;
    const parsed = receiptLookupSchema.safeParse({ receiptId: decodeURIComponent(receiptId) });
    if (!parsed.success) {
      throw new AppError("invalid_request", "Check the submitted fields and try again.", 400);
    }
    const services = createApplicationServices();
    const session = requireRequestSession(request, services.authConfig.sessionSecret);
    return Response.json({ receipt: await services.payments.getReceipt(session, parsed.data.receiptId) });
  } catch (error) {
    return errorResponse(error);
  }
}
