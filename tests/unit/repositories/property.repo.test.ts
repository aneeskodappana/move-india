import type { NewProperty, Property } from "@/db/schema";
import { createPropertyRepository } from "@/repositories/property.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("PropertyRepository", () => {
  it("inserts and returns a property", async () => {
    const input: NewProperty = {
      addressLine: "Demo Lotus House, Lane 1",
      ward: "Elamkulam",
      mockQrId: "VN-EKM-01-1001",
      latitude: 9.968,
      longitude: 76.299,
      routeId: "10000000-0000-4000-8000-000000000001",
    };
    const expected: Property = {
      id: "20000000-0000-4000-8000-000000000001",
      ...input,
    };
    const harness = createInsertHarness(expected);

    await expect(createPropertyRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
