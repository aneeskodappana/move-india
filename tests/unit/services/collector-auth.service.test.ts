import { createFixedWindowRateLimiter } from "@/lib/rate-limit";
import { createCollectorAuthService } from "@/services/collector-auth.service";

describe("CollectorAuthService", () => {
  it("accepts only the fixed DEV collector code", () => {
    const service = createCollectorAuthService({
      devCollectorCode: "654321",
      rateLimiter: createFixedWindowRateLimiter({ limit: 5, windowMs: 60_000 }),
    });
    expect(service.verifyCode({ code: "654321" }, "test")).toEqual({ role: "collector" });
    expect(() => service.verifyCode({ code: "123456" }, "test")).toThrow("DEV collector code");
  });

  it("rate-limits repeated collector login attempts", () => {
    const service = createCollectorAuthService({
      devCollectorCode: "654321",
      rateLimiter: createFixedWindowRateLimiter({
        limit: 2,
        windowMs: 60_000,
        message: "Too many collector login attempts. Wait a few minutes and try again.",
      }),
    });
    expect(() => service.verifyCode({ code: "000000" }, "same-client")).toThrow("DEV collector code");
    expect(() => service.verifyCode({ code: "000000" }, "same-client")).toThrow("DEV collector code");
    expect(() => service.verifyCode({ code: "000000" }, "same-client")).toThrow("Too many collector login attempts");
  });
});
