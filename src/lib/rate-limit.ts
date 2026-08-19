import { AppError } from "@/lib/app-error";

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

export type RateLimiter = {
  consume(key: string, now?: number): void;
};

export function createFixedWindowRateLimiter(options: {
  limit: number;
  windowMs: number;
  message?: string;
}): RateLimiter {
  const entries = new Map<string, RateLimitEntry>();
  const message = options.message ?? "Too many OTP requests. Wait a few minutes and try again.";

  return {
    consume(key, now = Date.now()) {
      const current = entries.get(key);
      const entry = !current || current.resetAt <= now
        ? { attempts: 0, resetAt: now + options.windowMs }
        : current;

      if (entry.attempts >= options.limit) {
        throw new AppError("rate_limited", message, 429);
      }

      entry.attempts += 1;
      entries.set(key, entry);
    },
  };
}

const globalRateLimit = globalThis as typeof globalThis & {
  vandiOtpRateLimiter?: RateLimiter;
  vandiCollectorRateLimiter?: RateLimiter;
};

export const otpRateLimiter =
  globalRateLimit.vandiOtpRateLimiter ??
  createFixedWindowRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export const collectorRateLimiter =
  globalRateLimit.vandiCollectorRateLimiter ??
  createFixedWindowRateLimiter({
    limit: 5,
    windowMs: 10 * 60 * 1000,
    message: "Too many collector login attempts. Wait a few minutes and try again.",
  });

if (process.env.NODE_ENV !== "production") {
  globalRateLimit.vandiOtpRateLimiter = otpRateLimiter;
  globalRateLimit.vandiCollectorRateLimiter = collectorRateLimiter;
}
