import { AppError } from "@/lib/app-error";
import type { CollectorLoginInput } from "@/schemas/coordinator.schema";

export function createCollectorAuthService(devCollectorCode: string) {
  return {
    verifyCode(input: CollectorLoginInput) {
      if (input.code !== devCollectorCode) {
        throw new AppError("invalid_code", "That DEV collector code is not correct.", 401);
      }
      return { role: "collector" as const };
    },
  };
}

export type CollectorAuthService = ReturnType<typeof createCollectorAuthService>;
