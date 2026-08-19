import type { HandoverLog, NewHandoverLog } from "@/db/schema";
import { createHandoverRepository } from "@/repositories/handover.repo";
import type { DatabaseClient } from "@/db/client";
import { createInsertHarness, createSelectOneHarness } from "../../helpers/mock-database";

const expected: HandoverLog = {
  id: "50000000-0000-4000-8000-000000000001",
  occupantId: "30000000-0000-4000-8000-000000000001",
  collectionEventId: "40000000-0000-4000-8000-000000000001",
  residentMarkedAt: new Date("2026-08-18T02:10:00.000Z"),
  collectorMarkedAt: null,
  photoUrl: null,
  status: "kept_out",
};

describe("HandoverRepository", () => {
  it("inserts and returns a handover log", async () => {
    const residentMarkedAt = new Date("2026-08-18T02:10:00.000Z");
    const input: NewHandoverLog = {
      occupantId: "30000000-0000-4000-8000-000000000001",
      collectionEventId: "40000000-0000-4000-8000-000000000001",
      residentMarkedAt,
      status: "kept_out",
    };
    const harness = createInsertHarness(expected);

    await expect(createHandoverRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });

  it("finds a handover by id and by resident/event pair", async () => {
    const byId = createSelectOneHarness([expected]);
    await expect(createHandoverRepository(byId.database).findById(expected.id)).resolves.toEqual(expected);
    const byPair = createSelectOneHarness([expected]);
    await expect(createHandoverRepository(byPair.database).findByOccupantAndEvent(expected.occupantId, expected.collectionEventId)).resolves.toEqual(expected);
    expect(byPair.limit).toHaveBeenCalledWith(1);
  });

  it("records the collector timestamp and collected status", async () => {
    const collectorMarkedAt = new Date("2026-08-18T02:25:00.000Z");
    const collected = { ...expected, collectorMarkedAt, status: "collected" as const };
    const returning = vi.fn().mockResolvedValue([collected]);
    const where = vi.fn().mockReturnValue({ returning });
    const set = vi.fn().mockReturnValue({ where });
    const update = vi.fn().mockReturnValue({ set });
    const database = { update } as unknown as DatabaseClient;
    await expect(createHandoverRepository(database).confirmCollected(expected.id, collectorMarkedAt)).resolves.toEqual(collected);
    expect(set).toHaveBeenCalledWith({ collectorMarkedAt, status: "collected" });
  });

  it("lists pending resident-marked handovers for a date", async () => {
    const row = {
      id: expected.id,
      residentName: "Anjali Nair",
      addressLine: "Demo Lotus House, Lane 1",
      ward: "Elamkulam",
      routeName: "Demo Elamkulam North",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      residentMarkedAt: expected.residentMarkedAt,
      photoUrl: null,
    };
    const orderBy = vi.fn().mockResolvedValue([row]);
    const where = vi.fn().mockReturnValue({ orderBy });
    const innerJoin = vi.fn();
    innerJoin.mockReturnValue({ innerJoin, where });
    const from = vi.fn().mockReturnValue({ innerJoin });
    const select = vi.fn().mockReturnValue({ from });
    const database = { select } as unknown as DatabaseClient;
    await expect(createHandoverRepository(database).listPendingByDate("2026-08-18")).resolves.toEqual([row]);
    expect(innerJoin).toHaveBeenCalledTimes(4);
    expect(orderBy).toHaveBeenCalledOnce();
  });
});
