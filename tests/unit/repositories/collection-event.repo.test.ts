import type { CollectionEvent, NewCollectionEvent } from "@/db/schema";
import { createCollectionEventRepository } from "@/repositories/collection-event.repo";
import { createInsertHarness, createSelectListHarness, createSelectOneHarness } from "../../helpers/mock-database";

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

  it("finds the event for a property and calendar date", async () => {
    const expected: CollectionEvent = {
      id: "40000000-0000-4000-8000-000000000001",
      routeId: "10000000-0000-4000-8000-000000000001",
      propertyId: "20000000-0000-4000-8000-000000000001",
      eventDate: "2026-08-19",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      status: "scheduled",
    };
    const harness = createSelectOneHarness([expected]);

    await expect(
      createCollectionEventRepository(harness.database).findByPropertyAndDate(
        expected.propertyId,
        expected.eventDate,
      ),
    ).resolves.toEqual(expected);
    expect(harness.limit).toHaveBeenCalledWith(1);
  });

  it("finds an event by id", async () => {
    const expected: CollectionEvent = {
      id: "40000000-0000-4000-8000-000000000002",
      routeId: "10000000-0000-4000-8000-000000000001",
      propertyId: "20000000-0000-4000-8000-000000000001",
      eventDate: "2026-08-19",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      status: "scheduled",
    };
    const harness = createSelectOneHarness([expected]);
    await expect(createCollectionEventRepository(harness.database).findById(expected.id)).resolves.toEqual(expected);
    expect(harness.limit).toHaveBeenCalledWith(1);
  });

  it("lists collection events for a property newest first", async () => {
    const expected: CollectionEvent = {
      id: "40000000-0000-4000-8000-000000000003",
      routeId: "10000000-0000-4000-8000-000000000001",
      propertyId: "20000000-0000-4000-8000-000000000001",
      eventDate: "2026-08-19",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      status: "scheduled",
    };
    const harness = createSelectListHarness([expected]);
    await expect(createCollectionEventRepository(harness.database).listByProperty(expected.propertyId)).resolves.toEqual([
      expected,
    ]);
    expect(harness.orderBy).toHaveBeenCalledOnce();
  });
});
