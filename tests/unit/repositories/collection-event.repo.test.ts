import type { CollectionEvent, NewCollectionEvent } from "@/db/schema";
import { createCollectionEventRepository } from "@/repositories/collection-event.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("CollectionEventRepository", () => {
  it("inserts and returns a collection event", async () => {
    const input: NewCollectionEvent = {
      routeId: "10000000-0000-4000-8000-000000000001",
      propertyId: "20000000-0000-4000-8000-000000000001",
      eventDate: "2026-08-18",
      materialType: "Plastic and dry waste",
      timeWindow: "7:30–9:00 AM",
      status: "scheduled",
    };
    const expected: CollectionEvent = {
      id: "40000000-0000-4000-8000-000000000001",
      ...input,
      status: "scheduled",
    };
    const harness = createInsertHarness(expected);

    await expect(createCollectionEventRepository(harness.database).create(input)).resolves.toEqual(
      expected,
    );
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
