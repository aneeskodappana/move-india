import type { PropertyRepository } from "@/repositories/property.repo";

export function createPropertyService(
  properties: Pick<PropertyRepository, "listWithOccupants">,
) {
  return {
    async listJoinOptions() {
      return properties.listWithOccupants();
    },
  };
}

export type PropertyService = ReturnType<typeof createPropertyService>;
