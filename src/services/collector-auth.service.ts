import { AppError } from "@/lib/app-error";
import type { RateLimiter } from "@/lib/rate-limit";
import type { CollectorLoginInput } from "@/schemas/coordinator.schema";

type CollectorAuthDependencies = {
  devCollectorCode: string;
  rateLimiter: RateLimiter;
};

export function createCollectorAuthService(dependencies: CollectorAuthDependencies) {
  return {
    verifyCode(input: CollectorLoginInput, clientKey: string) {
      dependencies.rateLimiter.consume(`collector:${clientKey}`);
      if (input.code !== dependencies.devCollectorCode) {
        throw new AppError("invalid_code", "That DEV collector code is not correct.", 401);
      }
      return { role: "collector" as const };
    },
  };
}

export type CollectorAuthService = ReturnType<typeof createCollectorAuthService>;
