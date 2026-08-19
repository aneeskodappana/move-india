import { collectorLoginInputSchema } from "@/schemas/coordinator.schema";
import { confirmCollectedInputSchema, markKeptOutInputSchema } from "@/schemas/handover.schema";

describe("M4 action schemas", () => {
  it("validates resident and collector action identifiers", () => {
    expect(markKeptOutInputSchema.parse({ collectionEventId: "40000000-0000-4000-8000-000000000001", photoUrl: "https://example.com/proof.jpg" })).toBeTruthy();
    expect(confirmCollectedInputSchema.parse({ handoverLogId: "50000000-0000-4000-8000-000000000001" })).toBeTruthy();
  });

  it("rejects malformed action payloads and collector codes", () => {
    expect(markKeptOutInputSchema.safeParse({ collectionEventId: "not-an-id" }).success).toBe(false);
    expect(confirmCollectedInputSchema.safeParse({ handoverLogId: "not-an-id" }).success).toBe(false);
    expect(collectorLoginInputSchema.safeParse({ code: "12345" }).success).toBe(false);
  });
});
