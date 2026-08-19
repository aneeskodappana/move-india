import { formatScheduleDate, indiaIsoDate } from "@/lib/india-date";

describe("India date helpers", () => {
  it("resolves the local calendar date across a UTC boundary", () => {
    expect(indiaIsoDate(new Date("2026-08-18T20:00:00.000Z"))).toBe("2026-08-19");
  });

  it("formats a schedule date for resident-facing copy", () => {
    expect(formatScheduleDate("2026-08-19")).toBe("Wednesday, 19 August");
  });
});
