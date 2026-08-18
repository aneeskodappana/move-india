import { buildSeedData } from "@/db/seed-data";

describe("buildSeedData", () => {
  it("builds a deterministic synthetic Kochi dataset with the proof-gap scenario", () => {
    const first = buildSeedData();
    const second = buildSeedData();

    expect(second).toEqual(first);
    expect(first.routes).toHaveLength(4);
    expect(first.properties).toHaveLength(8);
    expect(first.occupants.length).toBeGreaterThanOrEqual(12);
    expect(first.collectionEvents.length).toBeGreaterThanOrEqual(60);
    expect(first.handoverLogs.some((log) => log.status === "kept_out" && !log.collectorMarkedAt)).toBe(
      true,
    );
    expect(first.payments.some((payment) => payment.status === "pending")).toBe(true);
    expect(first.occupants.every((occupant) => occupant.phone.startsWith("+91-00000-"))).toBe(true);
  });
});
