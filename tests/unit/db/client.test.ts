import { createDatabaseClient } from "@/db/client";

describe("createDatabaseClient", () => {
  it("rejects a non-PostgreSQL connection string before opening a connection", () => {
    expect(() => createDatabaseClient("https://example.com/database")).toThrow(
      "DATABASE_URL must be a PostgreSQL connection string.",
    );
  });
});
