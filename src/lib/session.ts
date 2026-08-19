import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { syntheticPhoneSchema, uuidSchema } from "@/schemas/common";

const verifiedSessionSchema = z.object({
  version: z.literal(1),
  state: z.literal("verified"),
  phone: syntheticPhoneSchema,
  name: z.string().min(2).max(120),
  expiresAt: z.number().int().positive(),
});

const registeredSessionSchema = z.object({
  version: z.literal(1),
  state: z.literal("registered"),
  phone: syntheticPhoneSchema,
  name: z.string().min(2).max(120),
  occupantId: uuidSchema,
  propertyId: uuidSchema,
  expiresAt: z.number().int().positive(),
});

const sessionSchema = z.discriminatedUnion("state", [
  verifiedSessionSchema,
  registeredSessionSchema,
]);

export type Session = z.infer<typeof sessionSchema>;
export type SessionIdentity =
  | Omit<Extract<Session, { state: "verified" }>, "version" | "expiresAt">
  | Omit<Extract<Session, { state: "registered" }>, "version" | "expiresAt">;

function signatureFor(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function issueSessionToken(
  identity: SessionIdentity,
  secret: string,
  options: { now?: number; ttlSeconds?: number } = {},
): string {
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  const now = options.now ?? Date.now();
  const expiresAt = now + (options.ttlSeconds ?? 8 * 60 * 60) * 1000;
  const session: Session = identity.state === "registered"
    ? { ...identity, version: 1, expiresAt }
    : { ...identity, version: 1, expiresAt };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signatureFor(payload, secret).toString("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): Session | null {
  if (!token || secret.length < 32) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = signatureFor(payload, secret);
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const parsed = sessionSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success || parsed.data.expiresAt <= now) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
