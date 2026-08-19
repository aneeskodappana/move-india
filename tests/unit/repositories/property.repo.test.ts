import type { DatabaseClient } from "@/db/client";
import type { NewProperty, Property } from "@/db/schema";
import { createPropertyRepository } from "@/repositories/property.repo";
import { createInsertHarness, createSelectOneHarness } from "../../helpers/mock-database";

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

  it("finds a property by id", async () => {
    const expected: Property = {
      id: "20000000-0000-4000-8000-000000000001",
      addressLine: "Demo Lotus House, Lane 1",
      ward: "Elamkulam",
      mockQrId: "VN-EKM-01-1001",
      latitude: 9.968,
      longitude: 76.299,
      routeId: "10000000-0000-4000-8000-000000000001",
    };
    const harness = createSelectOneHarness([expected]);

    await expect(createPropertyRepository(harness.database).findById(expected.id)).resolves.toEqual(expected);
    expect(harness.limit).toHaveBeenCalledWith(1);
  });

  it("groups joined occupant rows into property join options", async () => {
    const property: Property = {
      id: "20000000-0000-4000-8000-000000000001",
      addressLine: "Demo Lotus House, Lane 1",
      ward: "Elamkulam",
      mockQrId: "VN-EKM-01-1001",
      latitude: 9.968,
      longitude: 76.299,
      routeId: "10000000-0000-4000-8000-000000000001",
    };
    const orderBy = vi.fn().mockResolvedValue([
      { property, occupant: { id: "30000000-0000-4000-8000-000000000001", name: "Ravi Menon", role: "owner" } },
      { property, occupant: { id: "30000000-0000-4000-8000-000000000002", name: "Neha Thomas", role: "tenant" } },
    ]);
    const leftJoin = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ leftJoin });
    const select = vi.fn().mockReturnValue({ from });
    const database = { select } as unknown as DatabaseClient;

    await expect(createPropertyRepository(database).listWithOccupants()).resolves.toEqual([
      { ...property, occupants: [
        { id: "30000000-0000-4000-8000-000000000001", name: "Ravi Menon", role: "owner" },
        { id: "30000000-0000-4000-8000-000000000002", name: "Neha Thomas", role: "tenant" },
      ] },
    ]);
    expect(orderBy).toHaveBeenCalled();
  });
});
