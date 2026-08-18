import type { NewOccupant, Occupant } from "@/db/schema";
import { createOccupantRepository } from "@/repositories/occupant.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("OccupantRepository", () => {
  it("inserts and returns an occupant", async () => {
    const input: NewOccupant = {
      propertyId: "20000000-0000-4000-8000-000000000001",
      name: "Anjali Nair",
      phone: "+91-00000-00001",
      role: "tenant",
      moveInDate: "2026-06-01",
    };
    const expected: Occupant = {
      id: "30000000-0000-4000-8000-000000000001",
      ...input,
      moveOutDate: null,
    };
    const harness = createInsertHarness(expected);

    await expect(createOccupantRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
