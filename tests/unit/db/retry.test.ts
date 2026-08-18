import { withDatabaseRetry } from "@/db/retry";

describe("withDatabaseRetry", () => {
  it("retries a transient failure and returns the eventual value", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("temporary fetch failure"))
      .mockResolvedValue("ready");

    await expect(withDatabaseRetry("Database check", operation, [0])).resolves.toBe("ready");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("stops after the configured attempt limit", async () => {
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(new Error("still down"));

    await expect(withDatabaseRetry("Database check", operation, [0, 0])).rejects.toThrow(
      "Database check failed after 3 attempts.",
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
