import type { OccupantRepository } from "@/repositories/occupant.repo";
import type { RateLimiter } from "@/lib/rate-limit";
import { AppError } from "@/lib/app-error";
import type { RequestOtpInput, VerifyOtpInput } from "@/schemas/auth.schema";
import type { SessionIdentity } from "@/lib/session";

type AuthServiceDependencies = {
  occupants: Pick<OccupantRepository, "findByPhone">;
  rateLimiter: RateLimiter;
  devOtpCode: string;
};

export function createAuthService(dependencies: AuthServiceDependencies) {
  return {
    requestOtp(input: RequestOtpInput, clientKey: string) {
      dependencies.rateLimiter.consume(`request:${clientKey}:${input.phone}`);
      return { devOtp: dependencies.devOtpCode };
    },
    async verifyOtp(input: VerifyOtpInput, clientKey: string): Promise<SessionIdentity> {
      dependencies.rateLimiter.consume(`verify:${clientKey}:${input.phone}`);
      if (input.otp !== dependencies.devOtpCode) {
        throw new AppError("invalid_otp", "That DEV OTP is not correct.", 401);
      }

      const existing = await dependencies.occupants.findByPhone(input.phone);
      if (existing) {
        return {
          state: "registered",
          phone: existing.phone,
          name: existing.name,
          occupantId: existing.id,
          propertyId: existing.propertyId,
        };
      }

      return { state: "verified", phone: input.phone, name: input.name };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
