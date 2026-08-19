import type { NextRequest } from "next/server";
import { errorResponse, parseJson, requestClientKey } from "@/lib/http";
import { requestOtpInputSchema } from "@/schemas/auth.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, requestOtpInputSchema);
    const result = createApplicationServices().auth.requestOtp(input, requestClientKey(request));
    return Response.json({ ok: true, mode: "DEV MODE", ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
