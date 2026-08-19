import { EXAMPLE_SESSION_SECRET, getAuthConfig } from "@/lib/auth-config";

describe("getAuthConfig", () => {
  it("rejects the example session secret in a deployed environment", () => {
    expect(() =>
      getAuthConfig(
        {
          SESSION_SECRET: EXAMPLE_SESSION_SECRET,
          VERCEL: "1",
        },
        "production",
      ),
    ).toThrow("example value");
  });

  it("accepts a sufficiently long non-example secret", () => {
    expect(
      getAuthConfig({ SESSION_SECRET: "a".repeat(32), DEV_OTP_CODE: "123456" }, "development").sessionSecret,
    ).toHaveLength(32);
  });
});
