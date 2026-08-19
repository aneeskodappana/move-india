import { issueSessionToken, verifySessionToken } from "@/lib/session";

const secret = "test-session-secret-with-at-least-32-characters";

describe("signed sessions", () => {
  it("round-trips a verified identity and rejects tampering", () => {
    const token = issueSessionToken(
      { state: "verified", phone: "+91-00000-12345", name: "Anjali Nair" },
      secret,
      { now: 1_000, ttlSeconds: 60 },
    );

    expect(verifySessionToken(token, secret, 1_500)).toMatchObject({
      state: "verified",
      phone: "+91-00000-12345",
      name: "Anjali Nair",
    });
    expect(verifySessionToken(`${token}tampered`, secret, 1_500)).toBeNull();
  });

  it("rejects expired sessions", () => {
    const token = issueSessionToken(
      { state: "verified", phone: "+91-00000-12345", name: "Anjali Nair" },
      secret,
      { now: 1_000, ttlSeconds: 1 },
    );
    expect(verifySessionToken(token, secret, 2_001)).toBeNull();
  });
});
