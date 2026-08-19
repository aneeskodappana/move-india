import { createPropertyService } from "@/services/property.service";

describe("PropertyService", () => {
  it("returns repository-backed property join options", async () => {
    const listWithOccupants = vi.fn().mockResolvedValue([]);
    await expect(createPropertyService({ listWithOccupants }).listJoinOptions()).resolves.toEqual([]);
    expect(listWithOccupants).toHaveBeenCalledOnce();
  });
});
