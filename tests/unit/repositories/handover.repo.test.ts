import type { HandoverLog, NewHandoverLog } from "@/db/schema";
import { createHandoverRepository } from "@/repositories/handover.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("HandoverRepository", () => {
  it("inserts and returns a handover log", async () => {
    const residentMarkedAt = new Date("2026-08-18T02:10:00.000Z");
    const input: NewHandoverLog = {
      occupantId: "30000000-0000-4000-8000-000000000001",
      collectionEventId: "40000000-0000-4000-8000-000000000001",
      residentMarkedAt,
      status: "kept_out",
    };
    const expected: HandoverLog = {
      id: "50000000-0000-4000-8000-000000000001",
      ...input,
      status: "kept_out",
      collectorMarkedAt: null,
      photoUrl: null,
    };
    const harness = createInsertHarness(expected);

    await expect(createHandoverRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
