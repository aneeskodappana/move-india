import type { NextRequest } from "next/server";
import { errorResponse, parseJson } from "@/lib/http";
import { requestOtpInputSchema } from "@/schemas/auth.schema";
import { createApplicationServices } from "@/services/dependencies";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, requestOtpInputSchema);
    const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientKey = forwardedAddress || "local-demo";
    const result = createApplicationServices().auth.requestOtp(input, clientKey);
    return Response.json({ ok: true, mode: "DEV MODE", ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
