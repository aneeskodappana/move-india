import type { NextRequest } from "next/server";
import { AppError } from "@/lib/app-error";
import {
  COLLECTOR_COOKIE_NAME,
  verifyCollectorSessionToken,
} from "@/lib/collector-session";

export function requireRequestCollector(request: NextRequest, secret: string) {
  const actor = verifyCollectorSessionToken(
    request.cookies.get(COLLECTOR_COOKIE_NAME)?.value,
    secret,
  );
  if (!actor) throw new AppError("unauthorized", "Collector access is required.", 401);
  return actor;
}
