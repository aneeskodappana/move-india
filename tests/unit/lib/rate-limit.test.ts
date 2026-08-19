import { createFixedWindowRateLimiter } from "@/lib/rate-limit";

describe("fixed-window rate limiter", () => {
  it("blocks requests beyond the limit and resets after the window", () => {
    const limiter = createFixedWindowRateLimiter({ limit: 2, windowMs: 1_000 });
    limiter.consume("client", 0);
    limiter.consume("client", 1);
    expect(() => limiter.consume("client", 2)).toThrow("Too many OTP requests");
    expect(() => limiter.consume("client", 1_001)).not.toThrow();
  });
});
