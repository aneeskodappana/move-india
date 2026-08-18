import type { Grievance, NewGrievance } from "@/db/schema";
import { createGrievanceRepository } from "@/repositories/grievance.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("GrievanceRepository", () => {
  it("inserts and returns a grievance", async () => {
    const filedAt = new Date("2026-08-18T06:30:00.000Z");
    const input: NewGrievance = {
      occupantId: "30000000-0000-4000-8000-000000000001",
      handoverLogId: "50000000-0000-4000-8000-000000000001",
      description: "Collector confirmation is missing from this handover.",
      status: "open",
      filedAt,
    };
    const expected: Grievance = {
      id: "70000000-0000-4000-8000-000000000001",
      ...input,
      status: "open",
      filedAt,
    };
    const harness = createInsertHarness(expected);

    await expect(createGrievanceRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
