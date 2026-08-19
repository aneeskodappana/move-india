import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const collectorSessionSchema = z.object({
  role: z.literal("collector"),
  expiresAt: z.number().int().positive(),
});

export type CollectorSession = z.infer<typeof collectorSessionSchema>;
export const COLLECTOR_COOKIE_NAME = "vandi_collector_session";
export const COLLECTOR_SESSION_TTL_SECONDS = 4 * 60 * 60;

function signatureFor(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(`collector:${payload}`).digest();
}

export function issueCollectorSessionToken(
  secret: string,
  options: { now?: number; ttlSeconds?: number } = {},
): string {
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const now = options.now ?? Date.now();
  const payload = Buffer.from(JSON.stringify({
    role: "collector",
    expiresAt: now + (options.ttlSeconds ?? COLLECTOR_SESSION_TTL_SECONDS) * 1000,
  })).toString("base64url");
  return `${payload}.${signatureFor(payload, secret).toString("base64url")}`;
}

export function verifyCollectorSessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): CollectorSession | null {
  if (!token || secret.length < 32) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = signatureFor(payload, secret);
  const provided = Buffer.from(signature, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const parsed = collectorSessionSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success || parsed.data.expiresAt <= now) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
