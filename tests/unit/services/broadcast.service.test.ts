import { createBroadcastService } from "@/services/broadcast.service";

describe("BroadcastService", () => {
  it("composes one precise collection message for every channel", () => {
    expect(createBroadcastService().composeScheduleMessage({
      address: "Demo Lotus House, Lane 1",
      date: "2026-08-19",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
    })).toBe(
      "Vandi collection for Demo Lotus House, Lane 1: Food waste on Wednesday, 19 August, 7:00–8:30 AM. Keep it ready within the collection window.",
    );
  });

  it("composes an honest no-collection update", () => {
    expect(createBroadcastService().composeScheduleMessage({
      address: "Demo Lotus House, Lane 1",
      date: "2026-08-20",
    })).toContain("No collection is scheduled");
  });
});
