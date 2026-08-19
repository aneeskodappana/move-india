import { issueCollectorSessionToken, verifyCollectorSessionToken } from "@/lib/collector-session";

const secret = "test-session-secret-with-at-least-32-characters";

describe("signed collector sessions", () => {
  it("round-trips a collector actor and rejects resident-token-style tampering", () => {
    const token = issueCollectorSessionToken(secret, { now: 1_000, ttlSeconds: 60 });
    expect(verifyCollectorSessionToken(token, secret, 1_500)).toEqual({ role: "collector", expiresAt: 61_000 });
    expect(verifyCollectorSessionToken(`${token}tampered`, secret, 1_500)).toBeNull();
  });

  it("rejects expired and malformed sessions", () => {
    const token = issueCollectorSessionToken(secret, { now: 1_000, ttlSeconds: 1 });
    expect(verifyCollectorSessionToken(token, secret, 2_001)).toBeNull();
    expect(verifyCollectorSessionToken("broken", secret, 1_500)).toBeNull();
  });
});
