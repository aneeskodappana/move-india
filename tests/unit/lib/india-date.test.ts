import { formatMonthLabel, formatScheduleDate, indiaIsoDate, indiaYearMonth } from "@/lib/india-date";

describe("India date helpers", () => {
  it("resolves the local calendar date across a UTC boundary", () => {
    expect(indiaIsoDate(new Date("2026-08-18T20:00:00.000Z"))).toBe("2026-08-19");
  });

  it("formats a schedule date for resident-facing copy", () => {
    expect(formatScheduleDate("2026-08-19")).toBe("Wednesday, 19 August");
  });

  it("resolves the India billing month and a resident-facing month label", () => {
    expect(indiaYearMonth(new Date("2026-08-18T20:00:00.000Z"))).toBe("2026-08");
    expect(formatMonthLabel("2026-08")).toBe("August 2026");
  });
});
