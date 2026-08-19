import { AppError } from "@/lib/app-error";
import type { Session } from "@/lib/session";
import type { OccupantRepository } from "@/repositories/occupant.repo";
import type { PropertyRepository } from "@/repositories/property.repo";
import type { JoinPropertyInput } from "@/schemas/registration.schema";

type OccupantServiceDependencies = {
  occupants: Pick<OccupantRepository, "create" | "findByPhone">;
  properties: Pick<PropertyRepository, "findById">;
};

export function createOccupantService(dependencies: OccupantServiceDependencies) {
  return {
    async register(session: Session, input: JoinPropertyInput) {
      if (session.state !== "verified") {
        throw new AppError("forbidden", "This session has already joined a property.", 403);
      }

      const [property, existingOccupant] = await Promise.all([
        dependencies.properties.findById(input.propertyId),
        dependencies.occupants.findByPhone(session.phone),
      ]);
      if (!property) throw new AppError("not_found", "That address was not found.", 404);
      if (existingOccupant) {
        throw new AppError("conflict", "This phone is already registered.", 409);
      }

      return dependencies.occupants.create({
        propertyId: input.propertyId,
        phone: session.phone,
        name: session.name,
        role: input.role,
        moveInDate: input.moveInDate,
      });
    },
  };
}

export type OccupantService = ReturnType<typeof createOccupantService>;
