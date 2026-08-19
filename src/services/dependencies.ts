import { getDatabaseClient } from "@/db/client";
import { getAuthConfig } from "@/lib/auth-config";
import { otpRateLimiter } from "@/lib/rate-limit";
import { createOccupantRepository } from "@/repositories/occupant.repo";
import { createPropertyRepository } from "@/repositories/property.repo";
import { createAuthService } from "@/services/auth.service";
import { createOccupantService } from "@/services/occupant.service";
import { createPropertyService } from "@/services/property.service";

export function createApplicationServices() {
  const database = getDatabaseClient();
  const occupants = createOccupantRepository(database);
  const properties = createPropertyRepository(database);
  const authConfig = getAuthConfig();

  return {
    auth: createAuthService({
      occupants,
      rateLimiter: otpRateLimiter,
      devOtpCode: authConfig.devOtpCode,
    }),
    occupants: createOccupantService({ occupants, properties }),
    properties: createPropertyService(properties),
    authConfig,
  };
}
